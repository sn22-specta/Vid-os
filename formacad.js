import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {TransformControls} from 'three/addons/controls/TransformControls.js';
import {STLExporter} from 'three/addons/exporters/STLExporter.js';
const $=id=>document.getElementById(id),canvas=$('view'),scene=new T.Scene();scene.background=new T.Color('#171a20');
const camera=new T.PerspectiveCamera(45,1,.1,3000);camera.position.set(120,100,140);
const renderer=new T.WebGLRenderer({canvas,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));
const orbit=new OrbitControls(camera,canvas);orbit.enableDamping=true;orbit.target.set(0,10,0);
scene.add(new T.HemisphereLight(0xe0eaff,0x454957,2));const light=new T.DirectionalLight(0xffffff,2.5);light.position.set(80,120,70);scene.add(light);scene.add(new T.GridHelper(300,30));scene.add(new T.AxesHelper(50));
const group=new T.Group();scene.add(group);const gizmo=new TransformControls(camera,renderer.domElement);scene.add(gizmo.getHelper());gizmo.addEventListener('dragging-changed',e=>orbit.enabled=!e.value);
let selected=null,mode='select',seq=1;
function create(type,p={}){if(type==='Esquisse rectangle'||type==='Esquisse cercle')return createSketch(type,p);const geo=type==='Bloc'?new T.BoxGeometry(p.width||40,p.depth||30,p.height||30):type==='Sphère'?new T.SphereGeometry(p.radius||20,32,24):new T.CylinderGeometry(p.radius||15,p.radius||15,p.depth||35,32);const colors={Bloc:'#8db7ff',Sphère:'#a5e6c2',Cylindre:'#e5b5ff',Extrusion:'#8db7ff'};const o=new T.Mesh(geo,new T.MeshStandardMaterial({color:p.color||colors[type]||'#8db7ff'}));o.name=p.name||type+' '+seq++;o.userData.type=type;o.userData.params={width:p.width||40,height:p.height||30,depth:p.depth||35,radius:p.radius||20};o.position.set(p.x||0,p.y??(type==='Sphère'?20:(p.depth||30)/2),p.z||0);o.rotation.set(p.rx||0,p.ry||0,p.rz||0);o.scale.set(p.sx||1,p.sy||1,p.sz||1);group.add(o);return o}
function createSketch(type,p={}){const w=Number(p.width)||80,h=Number(p.height)||50,r=Number(p.radius)||25;let pts=[];if(type==='Esquisse rectangle'){pts=[[-w/2,0,-h/2],[w/2,0,-h/2],[w/2,0,h/2],[-w/2,0,h/2]]}else{for(let i=0;i<64;i++){const a=i*Math.PI*2/64;pts.push([Math.cos(a)*r,0,Math.sin(a)*r])}}const g=new T.BufferGeometry().setFromPoints(pts.map(v=>new T.Vector3(...v)));const o=new T.LineLoop(g,new T.LineBasicMaterial({color:'#ffd166'}));o.name=p.name||type+' '+seq++;o.userData.type=type;o.userData.isSketch=true;o.userData.params={width:w,height:h,radius:r};o.position.set(p.x||0,p.y||0,p.z||0);group.add(o);return o}
function extrudeSketch(){if(!selected||!selected.userData.isSketch){alert('Sélectionne d’abord une esquisse 2D dans l’arbre ou la vue.');return}const sk=selected,par=sk.userData.params||{},raw=prompt('Profondeur d’extrusion en mm :','20');if(raw===null)return;const depth=Number(raw);if(!Number.isFinite(depth)||depth<=0||depth>10000){alert('Entre une profondeur positive valide.');return}const type=sk.userData.type==='Esquisse cercle'?'Cylindre':'Bloc';const mesh=create(type,{name:'Extrusion — '+sk.name,depth,width:par.width,height:par.height,radius:par.radius,x:sk.position.x,y:sk.position.y+depth/2,z:sk.position.z,color:'#8db7ff'});mesh.userData.type='Extrusion';mesh.userData.feature={operation:'Extrusion',source:sk.name,depth,profile:sk.userData.type};group.remove(sk);choose(mesh);drawTree()}
function project(){return{name:$('name').value,format:'FormaCAD Studio',version:2,units:'mm',objects:group.children.map(o=>({type:o.userData.type,name:o.name,color:'#'+o.material.color.getHexString(),x:o.position.x,y:o.position.y,z:o.position.z,rx:o.rotation?.x||0,ry:o.rotation?.y||0,rz:o.rotation?.z||0,sx:o.scale?.x||1,sy:o.scale?.y||1,sz:o.scale?.z||1,...(o.userData.params||{}),feature:o.userData.feature||null}))}}
function choose(o){selected=o;gizmo.detach();if(o&&mode!=='select'){gizmo.setMode(mode);gizmo.attach(o)}drawTree();drawProps()}
function drawTree(){const el=$('tree');el.replaceChildren();group.children.forEach(o=>{const d=document.createElement('div');d.textContent=o.userData.type+' — '+o.name;d.style.cssText='padding:8px;cursor:pointer;border-radius:6px;'+(o===selected?'background:#30425e':'');d.onclick=()=>choose(o);el.append(d)})}
function drawProps(){const el=$('props');if(!selected){el.textContent='Sélectionne un objet.';return}el.innerHTML='<p>Nom</p><input id="objname"><p>Position X / Y / Z</p><div><input data-p="x" type="number" style="width:30%"><input data-p="y" type="number" style="width:30%"><input data-p="z" type="number" style="width:30%"></div><p>Échelle X / Y / Z</p><div><input data-p="sx" type="number" style="width:30%"><input data-p="sy" type="number" style="width:30%"><input data-p="sz" type="number" style="width:30%"></div><p>Couleur</p><input id="color" type="color">';$('objname').value=selected.name;for(const i of el.querySelectorAll('[data-p]')){i.value=selected[i.dataset.p[0]==='s'?'scale':'position'][i.dataset.p[1]||i.dataset.p[0]]??1;i.onchange=()=>{const k=i.dataset.p,v=Number(i.value);if(k[0]==='s')selected.scale[k[1]]=Math.max(.01,v);else selected.position[k]=v}}$('objname').onchange=e=>{selected.name=e.target.value;drawTree()};$('color').value='#'+selected.material.color.getHexString();$('color').oninput=e=>selected.material.color.set(e.target.value)}
function add(t){choose(create(t));drawTree()}$('box').onclick=()=>add('Bloc');$('sphere').onclick=()=>add('Sphère');$('cylinder').onclick=()=>add('Cylindre');$('sketch-rect').onclick=()=>{const w=Number(prompt('Largeur du rectangle en mm :','80'));if(!Number.isFinite(w)||w<=0)return;const h=Number(prompt('Hauteur du rectangle en mm :','50'));if(!Number.isFinite(h)||h<=0)return;choose(createSketch('Esquisse rectangle',{width:w,height:h}));drawTree()};$('sketch-circle').onclick=()=>{const r=Number(prompt('Rayon du cercle en mm :','25'));if(!Number.isFinite(r)||r<=0)return;choose(createSketch('Esquisse cercle',{radius:r}));drawTree()};$('extrude').onclick=extrudeSketch;$('delete').onclick=()=>{if(selected){group.remove(selected);choose(null)}};
$('save').onclick=()=>{localStorage.setItem('formacad-project',JSON.stringify(project()));$('save').textContent='Enregistré';setTimeout(()=>$('save').textContent='Enregistrer',1200)};
$('json').onclick=()=>download('formacad.json',JSON.stringify(project(),null,2),'application/json');$('stl').onclick=()=>{const solids=new T.Group();group.children.filter(o=>!o.userData.isSketch).forEach(o=>solids.add(o.clone()));download('formacad.stl',new STLExporter().parse(solids),'model/stl')};
$('open').onclick=()=> $('file-input').click();
$('file-input').onchange=async e=>{const f=e.target.files?.[0];if(!f)return;try{const data=JSON.parse(await f.text());if(!Array.isArray(data.objects))throw new Error('Format de projet invalide');group.clear();$('name').value=data.name||'Projet importé';data.objects.forEach(p=>{const o=(p.type==='Esquisse rectangle'||p.type==='Esquisse cercle')?createSketch(p.type,p):create(p.type||'Bloc',p);if(p.feature)o.userData.feature=p.feature});choose(null);drawTree();localStorage.setItem('formacad-project',JSON.stringify(project()))}catch(err){alert('Impossible d’ouvrir ce projet JSON : '+err.message)}e.target.value=''};
$('new-project').onclick=()=>{if(confirm('Créer un nouveau projet ? Les changements non enregistrés seront perdus.')){group.clear();$('name').value='Projet sans titre';create('Bloc',{name:'Bloc de départ'});choose(null);drawTree()}};
function download(n,d,t){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([d],{type:t}));a.download=n;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{mode=b.dataset.mode;document.querySelectorAll('[data-mode]').forEach(x=>x.classList.toggle('active',x===b));if(mode==='select')gizmo.detach();else if(selected){gizmo.setMode(mode);gizmo.attach(selected)}});
canvas.addEventListener('pointerdown',e=>{const r=canvas.getBoundingClientRect(),v=new T.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),ray=new T.Raycaster();ray.setFromCamera(v,camera);const hits=ray.intersectObjects(group.children);if(hits.length)choose(hits[0].object)});
new ResizeObserver(()=>{const w=canvas.clientWidth,h=canvas.clientHeight;if(w&&h){renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}}).observe(canvas);
function animate(){requestAnimationFrame(animate);orbit.update();renderer.render(scene,camera)}
try {
 const saved=JSON.parse(localStorage.getItem('formacad-project')||'null');
 if(saved&&Array.isArray(saved.objects)&&saved.objects.length){
  $('name').value=saved.name||'Projet sans titre';
  saved.objects.forEach(p=>{const o=(p.type==='Esquisse rectangle'||p.type==='Esquisse cercle')?createSketch(p.type,p):create(p.type||'Bloc',p);if(p.feature)o.userData.feature=p.feature});
 } else create('Bloc',{name:'Bloc de départ'});
} catch(e) { console.warn('Projet local ignoré :',e); create('Bloc',{name:'Bloc de départ'}); }
choose(null);drawTree();animate();


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
