import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
const scrypt = promisify(scryptCallback);
const equal = (a,b) => { const x=Buffer.from(a), y=Buffer.from(b); return x.length===y.length && timingSafeEqual(x,y); };
export async function passwordHash(password) {
  if (typeof password !== 'string' || password.length < 12 || password.length > 256) throw Error('Senha invalida');
  const salt=randomBytes(16).toString('hex');
  return salt+':'+(await scrypt(password,salt,64)).toString('hex');
}
export function createOperatorAuth({ username, passwordScrypt, origin, secure = true, now = Date.now, ttl = 3600000 } = {}) {
  if (!username || !/^[a-f0-9]{32}:[a-f0-9]{128}$/.test(passwordScrypt || '') || new URL(origin).origin !== origin) throw Error('Configure o acesso do operador e PUBLIC_ORIGIN');
  const sessions=new Map(), failures=new Map();
  let pending=0;
  const cookieName=secure?'__Host-gsw_session':'gsw_session';
  const cookie=(value,age)=>`${cookieName}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${age}${secure?'; Secure':''}`;
  function prune(map) { for(const [key,item] of map) if(item.until<=now()) map.delete(key); }
  function session(req) {
    prune(sessions);
    const token=(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(cookieName+'='))?.slice(cookieName.length+1);
    return token && sessions.get(token);
  }
  function sameOrigin(req) { return req.headers.origin===origin; }
  async function login(req,data) {
    prune(failures); prune(sessions);
    if (!data || typeof data !== "object" || Array.isArray(data)) return {status:400};
    if (!sameOrigin(req)) return {status:403};
    const ip=req.socket.remoteAddress||'unknown', failure=failures.get(ip);
    if (pending>=4 || failure?.count>=5 || failures.size>=10000) return {status:429};
    const candidate=typeof data.password==='string' && data.password.length<=256 ? data.password : '';
    const [salt,expected]=passwordScrypt.split(':');
    pending++;
    let actual;
    try { actual=(await scrypt(candidate,salt,64)).toString('hex'); } finally { pending--; }
    if (!equal(String(data.username||''),username) || !equal(actual,expected)) {
      const current=failures.get(ip);
      failures.set(ip,{count:(current?.count||0)+1,until:current?.until||now()+900000});
      return {status:401};
    }
    failures.delete(ip);
    if(sessions.size>=1000) sessions.delete(sessions.keys().next().value);
    // A new login never reuses a token supplied by the client.
    const token=randomBytes(32).toString('hex');
    sessions.set(token,{username,until:now()+ttl});
    return {status:200,cookie:cookie(token,Math.floor(ttl/1000)),username};
  }
  function logout(req) {
    const token=(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(cookieName+'='))?.slice(cookieName.length+1);
    sessions.delete(token); return cookie('',0);
  }
  return {login,session,sameOrigin,logout};
}
