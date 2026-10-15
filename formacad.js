import * as T from 'three';
import { ADDITION, SUBTRACTION, Brush, Evaluator } from 'three-bvh-csg';
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
function create(type,p={}){if(type==='Esquisse rectangle'||type==='Esquisse cercle')return createSketch(type,p);const geo=(type==='Bloc'||(type==='Extrusion'&&p.feature?.profile==='Esquisse rectangle'))?new T.BoxGeometry(p.width||40,p.depth||30,p.height||30):type==='Sphère'?new T.SphereGeometry(p.radius||20,32,24):new T.CylinderGeometry(p.radius||15,p.radius||15,p.depth||35,32);const colors={Bloc:'#8db7ff',Sphère:'#a5e6c2',Cylindre:'#e5b5ff',Extrusion:'#8db7ff'};const o=new T.Mesh(geo,new T.MeshStandardMaterial({color:p.color||colors[type]||'#8db7ff'}));o.name=p.name||type+' '+seq++;o.userData.type=type;o.userData.params={width:p.width||40,height:p.height||30,depth:p.depth||35,radius:p.radius||20};o.position.set(p.x||0,p.y??(type==='Sphère'?20:(p.depth||30)/2),p.z||0);o.rotation.set(p.rx||0,p.ry||0,p.rz||0);o.scale.set(p.sx||1,p.sy||1,p.sz||1);group.add(o);return o}
function createSketch(type,p={}){const w=Number(p.width)||80,h=Number(p.height)||50,r=Number(p.radius)||25;let pts=[];if(type==='Esquisse rectangle'){pts=[[-w/2,0,-h/2],[w/2,0,-h/2],[w/2,0,h/2],[-w/2,0,h/2]]}else{for(let i=0;i<64;i++){const a=i*Math.PI*2/64;pts.push([Math.cos(a)*r,0,Math.sin(a)*r])}}const g=new T.BufferGeometry().setFromPoints(pts.map(v=>new T.Vector3(...v)));const o=new T.LineLoop(g,new T.LineBasicMaterial({color:'#ffd166'}));o.name=p.name||type+' '+seq++;o.userData.type=type;o.userData.isSketch=true;o.userData.params={width:w,height:h,radius:r};o.position.set(p.x||0,p.y||0,p.z||0);group.add(o);return o}
function extrudeSketch(){if(!selected||!selected.userData.isSketch){alert('Sélectionne d’abord une esquisse 2D dans l’arbre ou la vue.');return}const sk=selected,par=sk.userData.params||{},raw=prompt('Profondeur d’extrusion en mm :','20');if(raw===null)return;const depth=Number(raw);if(!Number.isFinite(depth)||depth<=0||depth>10000){alert('Entre une profondeur positive valide.');return}const type=sk.userData.type==='Esquisse cercle'?'Cylindre':'Bloc';const mesh=create(type,{name:'Extrusion — '+sk.name,depth,width:par.width,height:par.height,radius:par.radius,x:sk.position.x,y:sk.position.y+depth/2,z:sk.position.z,color:'#8db7ff'});mesh.userData.type='Extrusion';mesh.userData.feature={operation:'Extrusion',source:sk.name,depth,profile:sk.userData.type};group.remove(sk);choose(mesh);drawTree()}
function project(){return{name:$('name').value,format:'FormaCAD Studio',version:2,units:'mm',objects:group.children.map(o=>({type:o.userData.type,name:o.name,color:'#'+o.material.color.getHexString(),x:o.position.x,y:o.position.y,z:o.position.z,rx:o.rotation?.x||0,ry:o.rotation?.y||0,rz:o.rotation?.z||0,sx:o.scale?.x||1,sy:o.scale?.y||1,sz:o.scale?.z||1,...(o.userData.params||{}),feature:o.userData.feature||null,featureHistory:o.userData.featureHistory||[]}))}}
function choose(o){selected=o;gizmo.detach();if(o&&mode!=='select'){gizmo.setMode(mode);gizmo.attach(o)}drawTree();drawProps()}
function drawTree(){const el=$('tree');el.replaceChildren();group.children.forEach(o=>{const d=document.createElement('div');d.textContent=o.userData.type+' — '+o.name;d.style.cssText='padding:8px;cursor:pointer;border-radius:6px;'+(o===selected?'background:#30425e':'');d.onclick=()=>choose(o);el.append(d)})}
function drawProps(){
 const el=$('props');
 if(!selected){el.textContent='Sélectionne un objet.';return}
 const sketch=!!selected.userData.isSketch, params=selected.userData.params||{};
 el.innerHTML='<p>Nom</p><input id="objname"><p>Position X / Y / Z</p><div class="triple"><input data-p="x" type="number" aria-label="Position X"><input data-p="y" type="number" aria-label="Position Y"><input data-p="z" type="number" aria-label="Position Z"></div><p>Échelle X / Y / Z</p><div class="triple"><input data-p="sx" type="number" step="0.1" aria-label="Échelle X"><input data-p="sy" type="number" step="0.1" aria-label="Échelle Y"><input data-p="sz" type="number" step="0.1" aria-label="Échelle Z"></div>'+(sketch?'<p>Dimensions de l’esquisse (mm)</p>'+(selected.userData.type==='Esquisse rectangle'?'<div class="triple"><input data-dim="width" type="number" min="1" aria-label="Largeur"><input data-dim="height" type="number" min="1" aria-label="Hauteur"></div>':'<input data-dim="radius" type="number" min="1" aria-label="Rayon">'):'<p>Dimensions (mm)</p>'+(selected.userData.type==='Sphère'?'<input data-dim="radius" type="number" min="1" aria-label="Rayon">':(selected.userData.type==='Cylindre'||selected.userData.feature?.profile==='Esquisse cercle')?'<div class="triple"><input data-dim="radius" type="number" min="1" aria-label="Rayon"><input data-dim="depth" type="number" min="1" aria-label="Profondeur"></div>':'<div class="triple"><input data-dim="width" type="number" min="1" aria-label="Largeur"><input data-dim="depth" type="number" min="1" aria-label="Profondeur"><input data-dim="height" type="number" min="1" aria-label="Hauteur"></div>'))+'<p>Couleur</p><input id="color" type="color">';
 $('objname').value=selected.name;
 for(const i of el.querySelectorAll('[data-p]')){
  const k=i.dataset.p,axis=k[k.length-1];i.value=k[0]==='s'?selected.scale[axis]:selected.position[k];
  i.onchange=()=>{const v=Number(i.value);if(!Number.isFinite(v))return;if(k[0]==='s')selected.scale[axis]=Math.max(.01,v);else selected.position[k]=v}
 }
 for(const i of el.querySelectorAll('[data-dim]')){
  const k=i.dataset.dim;i.value=params[k]||25;
  i.onchange=()=>{const v=Number(i.value);if(!Number.isFinite(v)||v<=0){i.value=params[k]||25;return}
   params[k]=v;selected.userData.params=params;
   if(selected.userData.isSketch){const pos={x:selected.position.x,y:selected.position.y,z:selected.position.z};const next=createSketch(selected.userData.type,{...params,name:selected.name,...pos});group.remove(selected);choose(next);return}
   if(k==='width'||k==='height'||k==='depth'||k==='radius'){
    let geo;
    if(selected.userData.type==='Sphère')geo=new T.SphereGeometry(params.radius||20,32,24);
    else if(selected.userData.type==='Cylindre'||selected.userData.feature?.profile==='Esquisse cercle')geo=new T.CylinderGeometry(params.radius||15,params.radius||15,params.depth||35,32);
    else geo=new T.BoxGeometry(params.width||40,params.depth||30,params.height||30);
    selected.geometry.dispose();selected.geometry=geo;
   }
  }
 }
 $('objname').onchange=e=>{selected.name=e.target.value;drawTree()};
 $('color').value='#'+selected.material.color.getHexString();
 $('color').oninput=e=>selected.material.color.set(e.target.value);
}

/* FormaCAD feature operation: a genuine mesh subtraction for a through-hole.
   The cut is computed in the selected solid's local coordinate system. */
function cutThroughHole(){
 if(!selected||selected.userData.isSketch||!selected.geometry){alert('Sélectionne d’abord une pièce solide.');return;}
 const radius=Number(prompt('Rayon du trou traversant (mm) :','5'));
 if(!Number.isFinite(radius)||radius<=0||radius>10000)return;
 const px=Number(prompt('Position X du trou par rapport au centre de la pièce (mm) :','0'));
 if(!Number.isFinite(px))return;
 const pz=Number(prompt('Position Z du trou par rapport au centre de la pièce (mm) :','0'));
 if(!Number.isFinite(pz))return;
 try{
  const baseGeometry=selected.geometry.clone();
  baseGeometry.computeBoundingBox();
  const bounds=baseGeometry.boundingBox;
  const span=Math.max(bounds.max.x-bounds.min.x,bounds.max.y-bounds.min.y,bounds.max.z-bounds.min.z,1);
  if(radius*2>=Math.min(bounds.max.x-bounds.min.x,bounds.max.z-bounds.min.z)){alert('Le rayon du trou est trop grand pour cette pièce.');baseGeometry.dispose();return;}
  const base=new Brush(baseGeometry,selected.material.clone());
  const cutter=new Brush(new T.CylinderGeometry(radius,radius,span*4,48),new T.MeshStandardMaterial());
  cutter.position.set(px,0,pz);
  base.updateMatrixWorld(true);cutter.updateMatrixWorld(true);
  const evaluator=new Evaluator();evaluator.useGroups=false;
  const result=evaluator.evaluate(base,cutter,SUBTRACTION);
  if(!result.geometry||result.geometry.attributes.position.count===0)throw new Error('La découpe n’a produit aucune surface.');
  selected.geometry.dispose();selected.geometry=result.geometry;
  selected.userData.featureHistory=[...(selected.userData.featureHistory||[]),{operation:'Perçage traversant',radius,x:px,z:pz}];
  selected.userData.feature={operation:'Perçage traversant',radius,x:px,z:pz};
  baseGeometry.dispose();cutter.geometry.dispose();
  drawTree();drawProps();alert('Perçage appliqué à la pièce.');
 }catch(err){console.error('FormaCAD cut failed',err);alert('Le perçage a échoué : '+(err?.message||'erreur géométrique'));}
}

function combineSolid(operation){
 if(!selected||selected.userData.isSketch||!selected.geometry){alert('Sélectionne la pièce principale.');return;}
 const candidates=group.children.filter(o=>o!==selected&&!o.userData.isSketch&&o.geometry);
 if(!candidates.length){alert('Ajoute une deuxième pièce solide pour effectuer cette opération.');return;}
 const menu=candidates.map((o,i)=>`${i+1}. ${o.name} (${o.userData.type})`).join('\\n');
 const answer=prompt((operation===SUBTRACTION?'Choisis la pièce à soustraire :':'Choisis la pièce à fusionner :')+'\\n'+menu,'1');
 if(answer===null)return;
 const index=Number(answer)-1;
 if(!Number.isInteger(index)||index<0||index>=candidates.length){alert('Numéro de pièce invalide.');return;}
 const tool=candidates[index];
 try{
  selected.updateMatrixWorld(true);tool.updateMatrixWorld(true);
  const relative=selected.matrixWorld.clone().invert().multiply(tool.matrixWorld);
  const baseGeometry=selected.geometry.clone();
  const toolGeometry=tool.geometry.clone().applyMatrix4(relative);
  const base=new Brush(baseGeometry,selected.material.clone());
  const cutter=new Brush(toolGeometry,tool.material.clone());
  base.updateMatrixWorld(true);cutter.updateMatrixWorld(true);
  const evaluator=new Evaluator();evaluator.useGroups=false;
  const result=evaluator.evaluate(base,cutter,operation);
  if(!result.geometry||result.geometry.attributes.position.count===0)throw new Error('Résultat géométrique vide.');
  selected.geometry.dispose();selected.geometry=result.geometry;
  selected.userData.featureHistory=[...(selected.userData.featureHistory||[]),{operation:operation===SUBTRACTION?'Soustraction 3D':'Fusion 3D',tool:tool.name}];
  selected.userData.feature={operation:operation===SUBTRACTION?'Soustraction 3D':'Fusion 3D',tool:tool.name};
  group.remove(tool);tool.geometry.dispose();if(tool.material?.dispose)tool.material.dispose();
  baseGeometry.dispose();toolGeometry.dispose();
  choose(selected);frameAll();
 }catch(err){console.error('FormaCAD boolean operation failed',err);alert('Opération impossible : '+(err?.message||'erreur géométrique')+'. Essaie avec deux pièces fermées qui se croisent réellement.');}
}

function frameAll(){
 const visible=group.children.filter(o=>!o.userData.isSketch);
 if(!visible.length){orbit.target.set(0,0,0);camera.position.set(120,100,140);return;}
 const bounds=new T.Box3();
 visible.forEach(o=>bounds.expandByObject(o));
 if(bounds.isEmpty())return;
 const center=bounds.getCenter(new T.Vector3()),size=bounds.getSize(new T.Vector3());
 const radius=Math.max(size.x,size.y,size.z,20);
 orbit.target.copy(center);
 camera.position.copy(center).add(new T.Vector3(radius*1.8,radius*1.35,radius*1.8));
 camera.near=Math.max(.01,radius/1000);camera.far=Math.max(3000,radius*100);camera.updateProjectionMatrix();
 orbit.update();
}

function add(t){choose(create(t));drawTree()}$('box').onclick=()=>add('Bloc');$('sphere').onclick=()=>add('Sphère');$('cylinder').onclick=()=>add('Cylindre');$('sketch-rect').onclick=()=>{const w=Number(prompt('Largeur du rectangle en mm :','80'));if(!Number.isFinite(w)||w<=0)return;const h=Number(prompt('Hauteur du rectangle en mm :','50'));if(!Number.isFinite(h)||h<=0)return;choose(createSketch('Esquisse rectangle',{width:w,height:h}));drawTree()};$('sketch-circle').onclick=()=>{const r=Number(prompt('Rayon du cercle en mm :','25'));if(!Number.isFinite(r)||r<=0)return;choose(createSketch('Esquisse cercle',{radius:r}));drawTree()};$('extrude').onclick=extrudeSketch;$('hole').onclick=cutThroughHole;$('subtract').onclick=()=>combineSolid(SUBTRACTION);$('union').onclick=()=>combineSolid(ADDITION);$('frame').onclick=frameAll;$('delete').onclick=()=>{if(selected){group.remove(selected);choose(null)}};
$('save').onclick=()=>{localStorage.setItem('formacad-project',JSON.stringify(project()));$('save').textContent='Enregistré';setTimeout(()=>$('save').textContent='Enregistrer',1200)};
$('json').onclick=()=>download('formacad.json',JSON.stringify(project(),null,2),'application/json');$('stl').onclick=()=>{const solids=new T.Group();group.children.filter(o=>!o.userData.isSketch).forEach(o=>solids.add(o.clone()));download('formacad.stl',new STLExporter().parse(solids),'model/stl')};
$('open').onclick=()=> $('file-input').click();
$('file-input').onchange=async e=>{const f=e.target.files?.[0];if(!f)return;try{const data=JSON.parse(await f.text());if(!Array.isArray(data.objects))throw new Error('Format de projet invalide');group.clear();$('name').value=data.name||'Projet importé';data.objects.forEach(p=>{const o=(p.type==='Esquisse rectangle'||p.type==='Esquisse cercle')?createSketch(p.type,p):create(p.type||'Bloc',p);if(p.feature)o.userData.feature=p.feature;if(Array.isArray(p.featureHistory))o.userData.featureHistory=p.featureHistory});choose(null);drawTree();localStorage.setItem('formacad-project',JSON.stringify(project()))}catch(err){alert('Impossible d’ouvrir ce projet JSON : '+err.message)}e.target.value=''};
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
  saved.objects.forEach(p=>{const o=(p.type==='Esquisse rectangle'||p.type==='Esquisse cercle')?createSketch(p.type,p):create(p.type||'Bloc',p);if(p.feature)o.userData.feature=p.feature;if(Array.isArray(p.featureHistory))o.userData.featureHistory=p.featureHistory});
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
