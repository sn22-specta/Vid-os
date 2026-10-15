import * as T from 'https://cdn.jsdelivr.net/npm/three@0.166.1/build/three.module.js';
import {OrbitControls} from 'https://cdn.jsdelivr.net/npm/three@0.166.1/examples/jsm/controls/OrbitControls.js';
import {TransformControls} from 'https://cdn.jsdelivr.net/npm/three@0.166.1/examples/jsm/controls/TransformControls.js';
import {STLExporter} from 'https://cdn.jsdelivr.net/npm/three@0.166.1/examples/jsm/exporters/STLExporter.js';
const $=id=>document.getElementById(id),canvas=$('view'),scene=new T.Scene();scene.background=new T.Color('#171a20');
const camera=new T.PerspectiveCamera(45,1,.1,3000);camera.position.set(120,100,140);
const renderer=new T.WebGLRenderer({canvas,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));
const orbit=new OrbitControls(camera,canvas);orbit.enableDamping=true;orbit.target.set(0,10,0);
scene.add(new T.HemisphereLight(0xe0eaff,0x454957,2));const light=new T.DirectionalLight(0xffffff,2.5);light.position.set(80,120,70);scene.add(light);scene.add(new T.GridHelper(300,30));scene.add(new T.AxesHelper(50));
const group=new T.Group();scene.add(group);const gizmo=new TransformControls(camera,renderer.domElement);scene.add(gizmo.getHelper());gizmo.addEventListener('dragging-changed',e=>orbit.enabled=!e.value);
let selected=null,mode='select',seq=1;
function create(type,p={}){const geo=type==='Bloc'?new T.BoxGeometry(40,30,30):type==='Sphère'?new T.SphereGeometry(20,24,16):new T.CylinderGeometry(15,15,35,24);const colors={Bloc:'#8db7ff',Sphère:'#a5e6c2',Cylindre:'#e5b5ff'};const o=new T.Mesh(geo,new T.MeshStandardMaterial({color:p.color||colors[type]}));o.name=p.name||type+' '+seq++;o.userData.type=type;o.position.set(p.x||0,p.y??15,p.z||0);o.rotation.set(p.rx||0,p.ry||0,p.rz||0);o.scale.set(p.sx||1,p.sy||1,p.sz||1);group.add(o);return o}
function project(){return{name:$('name').value,format:'FormaCAD Studio',objects:group.children.map(o=>({type:o.userData.type,name:o.name,color:'#'+o.material.color.getHexString(),x:o.position.x,y:o.position.y,z:o.position.z,rx:o.rotation.x,ry:o.rotation.y,rz:o.rotation.z,sx:o.scale.x,sy:o.scale.y,sz:o.scale.z}))}}
function choose(o){selected=o;gizmo.detach();if(o&&mode!=='select'){gizmo.setMode(mode);gizmo.attach(o)}drawTree();drawProps()}
function drawTree(){const el=$('tree');el.replaceChildren();group.children.forEach(o=>{const d=document.createElement('div');d.textContent=o.userData.type+' — '+o.name;d.style.cssText='padding:8px;cursor:pointer;border-radius:6px;'+(o===selected?'background:#30425e':'');d.onclick=()=>choose(o);el.append(d)})}
function drawProps(){const el=$('props');if(!selected){el.textContent='Sélectionne un objet.';return}el.innerHTML='<p>Nom</p><input id="objname"><p>Position X / Y / Z</p><div><input data-p="x" type="number" style="width:30%"><input data-p="y" type="number" style="width:30%"><input data-p="z" type="number" style="width:30%"></div><p>Échelle X / Y / Z</p><div><input data-p="sx" type="number" style="width:30%"><input data-p="sy" type="number" style="width:30%"><input data-p="sz" type="number" style="width:30%"></div><p>Couleur</p><input id="color" type="color">';$('objname').value=selected.name;for(const i of el.querySelectorAll('[data-p]')){i.value=selected[i.dataset.p[0]==='s'?'scale':'position'][i.dataset.p[1]||i.dataset.p[0]]??1;i.onchange=()=>{const k=i.dataset.p,v=Number(i.value);if(k[0]==='s')selected.scale[k[1]]=Math.max(.01,v);else selected.position[k]=v}}$('objname').onchange=e=>{selected.name=e.target.value;drawTree()};$('color').value='#'+selected.material.color.getHexString();$('color').oninput=e=>selected.material.color.set(e.target.value)}
function add(t){choose(create(t));drawTree()}$('box').onclick=()=>add('Bloc');$('sphere').onclick=()=>add('Sphère');$('cylinder').onclick=()=>add('Cylindre');$('delete').onclick=()=>{if(selected){group.remove(selected);choose(null)}};
$('save').onclick=()=>{localStorage.setItem('formacad-project',JSON.stringify(project()));$('save').textContent='Enregistré';setTimeout(()=>$('save').textContent='Enregistrer',1200)};
$('json').onclick=()=>download('formacad.json',JSON.stringify(project(),null,2),'application/json');$('stl').onclick=()=>download('formacad.stl',new STLExporter().parse(group),'model/stl');
function download(n,d,t){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([d],{type:t}));a.download=n;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{mode=b.dataset.mode;document.querySelectorAll('[data-mode]').forEach(x=>x.classList.toggle('active',x===b));if(mode==='select')gizmo.detach();else if(selected){gizmo.setMode(mode);gizmo.attach(selected)}});
canvas.addEventListener('pointerdown',e=>{const r=canvas.getBoundingClientRect(),v=new T.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),ray=new T.Raycaster();ray.setFromCamera(v,camera);const hits=ray.intersectObjects(group.children);if(hits.length)choose(hits[0].object)});
new ResizeObserver(()=>{const w=canvas.clientWidth,h=canvas.clientHeight;if(w&&h){renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}}).observe(canvas);
function animate(){requestAnimationFrame(animate);orbit.update();renderer.render(scene,camera)}create('Bloc',{name:'Bloc de départ'});choose(null);drawTree();animate();


/* Optional Supabase cloud storage. Configuration is kept in this browser. */
let cloudClient=null, cloudUser=null;
async function initCloud(){
 const url=localStorage.getItem('formacad-supabase-url'), key=localStorage.getItem('formacad-supabase-key');
 if(url&&key){const m=await import('https://esm.sh/@supabase/supabase-js@2');cloudClient=m.createClient(url,key);const {data}=await cloudClient.auth.getSession();cloudUser=data.session?.user||null;}
}
$('settings').onclick=async()=>{
 try{
  if(!cloudClient){
   const url=prompt('URL de ton projet Supabase (https://….supabase.co) :');if(!url)return;
   const key=prompt('Clé publique Supabase (publishable ou anon). Jamais service_role :');if(!key)return;
   if(!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url.trim())){alert('URL Supabase invalide.');return;}
   const m=await import('https://esm.sh/@supabase/supabase-js@2');cloudClient=m.createClient(url.trim(),key.trim());
   localStorage.setItem('formacad-supabase-url',url.trim());localStorage.setItem('formacad-supabase-key',key.trim());
  }
  const {data}=await cloudClient.auth.getSession();cloudUser=data.session?.user||null;
  if(!cloudUser){
   const email=prompt('E-mail de ton compte Supabase Auth :');if(!email)return;
   const password=prompt('Mot de passe du compte Supabase Auth :');if(!password)return;
   const result=await cloudClient.auth.signInWithPassword({email,password});if(result.error)throw result.error;cloudUser=result.data.user;
  }
  alert('Supabase connecté. Le bouton Enregistrer sauvegardera le projet dans le cloud.');
 }catch(e){alert('Connexion Supabase impossible : '+e.message);}
};
$('save').onclick=async()=>{
 const payload=project();localStorage.setItem('formacad-project',JSON.stringify(payload));
 if(!cloudClient||!cloudUser){$('save').textContent='Sauvegardé local';setTimeout(()=>$('save').textContent='Enregistrer',1500);return;}
 try{
  let id=localStorage.getItem('formacad-cloud-project-id');if(!id){id=crypto.randomUUID();localStorage.setItem('formacad-cloud-project-id',id);}
  const {error}=await cloudClient.from('formacad_projects').upsert({id,user_id:cloudUser.id,name:payload.name||'Projet sans titre',project_data:payload,updated_at:new Date().toISOString()},{onConflict:'id'});
  if(error)throw error;$('save').textContent='Cloud OK';setTimeout(()=>$('save').textContent='Enregistrer',1800);
 }catch(e){console.error(e);alert('Sauvegarde cloud échouée. Vérifie le fichier supabase.sql et les politiques RLS. La copie locale a bien été sauvegardée.');}
};
initCloud().catch(e=>console.error('Supabase init:',e));
