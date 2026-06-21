const fs=require('fs');const {Pool}=require('pg');
const env=fs.readFileSync('.env.local','utf8');
const get=k=>(env.match(new RegExp('^'+k+'="?([^"\\n]+)"?','m'))||[])[1];
const u=new URL(get('DATABASE_URL'));u.searchParams.delete('sslmode');
const pool=new Pool({connectionString:u.toString(),ssl:{rejectUnauthorized:false}});
const SKIP=new Set(['oYMdja9D','zJwZoykJ','vkIYecsM']);
const DEFS=[['Dartmouth','dartmouth'],['New York','new-york'],['San Francisco','san-francisco'],['Ohio State','ohio-state'],['Pittsburgh','pittsburgh']];
const album=t=>{ if(!t)return null; const d=t.slice(0,10),hm=t.slice(11);
  if(d==='2024-10-10'||d==='2024-10-11')return'Pittsburgh';
  if(d==='2024-10-12'&&hm<='11:13')return'Pittsburgh';
  if(d<='2025-05-31')return'Ohio State';
  if(d>='2025-06-19'&&d<='2025-06-25')return'San Francisco';
  if(d>='2025-06-26'&&d<='2025-08-01')return'New York';
  if(d>='2025-08-07')return'Dartmouth'; return null; };
(async()=>{ const c=await pool.connect();
  try{ await c.query('BEGIN');
    await c.query('DELETE FROM photos WHERE id=$1',['oYMdja9D']);
    const nameToId={};
    for(const [title,slug] of DEFS){
      let r=await c.query('SELECT id FROM albums WHERE slug=$1',[slug]);
      if(!r.rows.length) r=await c.query('INSERT INTO albums (title,slug) VALUES ($1,$2) RETURNING id',[title,slug]);
      nameToId[title]=r.rows[0].id; }
    const {rows}=await c.query("SELECT id, to_char(taken_at AT TIME ZONE 'UTC','YYYY-MM-DD\"T\"HH24:MI') AS t FROM photos");
    const assign={};
    for(const r of rows){ if(SKIP.has(r.id))continue; const a=album(r.t); if(!a)continue; (assign[a]??=[]).push(r.id); }
    let total=0;
    for(const [name,ids] of Object.entries(assign)){
      for(const pid of ids){ await c.query('INSERT INTO album_photo (album_id,photo_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',[nameToId[name],pid]); total++; }
      console.log(`  ${name.padEnd(16)} ${ids.length} photos  (slug: ${DEFS.find(d=>d[0]===name)[1]})`); }
    await c.query('COMMIT');
    console.log(`\n✓ Deleted 1 duplicate, created/verified 5 albums, assigned ${total} photos.`);
  }catch(e){ await c.query('ROLLBACK'); console.error('ERR (rolled back):',e.message); process.exitCode=1; }
  finally{ c.release(); await pool.end(); }
})();
