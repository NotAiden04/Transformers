'use client'
import {useMemo,useRef,type ReactNode} from 'react'
import {ThreeEvent,useFrame} from '@react-three/fiber'
import * as THREE from 'three'

const AL='#8b9092', CAST='#747b7e', DARK='#252a2e', STEEL='#c7cbcd', FRICTION='#4a352b', BLACK='#0e1113'
const Mat=({c=AL,on=false,o=1,m=.72,r=.42}:{c?:string,on?:boolean,o?:number,m?:number,r?:number})=><meshStandardMaterial color={c} metalness={m} roughness={r} transparent={o<1} opacity={o} depthWrite={o>.35} emissive={on?'#6c080c':'#000'} emissiveIntensity={on?.6:0}/>
const axial=[0,0,Math.PI/2] as [number,number,number]

function bellShape(){const s=new THREE.Shape();s.moveTo(-1.02,-1.34);s.lineTo(-1.42,-1.05);s.lineTo(-1.62,-.42);s.lineTo(-1.56,.45);s.lineTo(-1.25,1.05);s.lineTo(-.7,1.42);s.lineTo(.02,1.55);s.lineTo(.72,1.39);s.lineTo(1.22,1.03);s.lineTo(1.5,.45);s.lineTo(1.54,-.3);s.lineTo(1.33,-.92);s.lineTo(.9,-1.26);s.closePath();const h=new THREE.Path();h.absellipse(0,.03,1.05,1.03,0,Math.PI*2,false,0);s.holes.push(h);return s}
function caseShape(w:number,h:number){const s=new THREE.Shape();s.moveTo(-w*.78,-h);s.lineTo(-w,-h*.66);s.lineTo(-w*.98,h*.34);s.lineTo(-w*.72,h*.82);s.lineTo(-w*.18,h);s.lineTo(w*.45,h*.9);s.lineTo(w*.86,h*.55);s.lineTo(w,h*.12);s.lineTo(w*.9,-h*.66);s.lineTo(w*.55,-h);s.closePath();return s}
function panShape(){const s=new THREE.Shape();s.moveTo(-1.62,-.58);s.lineTo(-1.34,-.8);s.lineTo(.92,-.8);s.lineTo(1.55,-.48);s.lineTo(1.65,.38);s.lineTo(1.22,.65);s.lineTo(-1.28,.62);s.lineTo(-1.63,.35);s.closePath();return s}
function valveShape(){const s=new THREE.Shape();s.moveTo(-1.8,-.5);s.lineTo(-1.5,-.78);s.lineTo(-.85,-.72);s.lineTo(-.5,-.88);s.lineTo(.35,-.84);s.lineTo(.7,-.63);s.lineTo(1.52,-.54);s.lineTo(1.78,-.2);s.lineTo(1.66,.43);s.lineTo(1.2,.62);s.lineTo(.42,.69);s.lineTo(.08,.84);s.lineTo(-.74,.72);s.lineTo(-1.2,.51);s.lineTo(-1.72,.3);s.closePath();return s}

function BoltRing({r=1,n=10,x=0,o=1}:{r?:number,n?:number,x?:number,o?:number}){return <>{Array.from({length:n}).map((_,i)=>{const a=i/n*Math.PI*2;return <mesh key={i} position={[x,Math.cos(a)*r,Math.sin(a)*r]} rotation={axial}><cylinderGeometry args={[.055,.055,.14,10]}/><Mat c="#3d4346" o={o}/></mesh>})}</>}
function Bell({o}:{o:number}){const s=useMemo(bellShape,[]),set=useMemo(()=>({depth:.82,bevelEnabled:true,bevelSegments:3,bevelSize:.08,bevelThickness:.06,steps:1}),[]);return <group>
 <mesh position={[-2.62,0,0]} rotation={[0,Math.PI/2,0]}><extrudeGeometry args={[s,set]}/><Mat c="#7e8588" o={o} r={.5}/></mesh>
 <mesh position={[-2.48,.03,0]} rotation={axial}><torusGeometry args={[1.1,.095,14,64]}/><Mat c="#596064" o={o}/></mesh>
 <BoltRing r={1.35} n={11} x={-2.4} o={o}/>
 <mesh position={[-2.18,1.16,.52]} rotation={[0,0,.35]}><boxGeometry args={[.45,.3,.45]}/><Mat c="#666d70" o={o}/></mesh>
 </group>}
function CaseBlock({x,d,w,h,o}:{x:number,d:number,w:number,h:number,o:number}){const s=useMemo(()=>caseShape(w,h),[w,h]),set=useMemo(()=>({depth:d,bevelEnabled:true,bevelSegments:2,bevelSize:.055,bevelThickness:.05,steps:1}),[d]);return <mesh position={[x-d/2,0,0]} rotation={[0,Math.PI/2,0]}><extrudeGeometry args={[s,set]}/><Mat c={CAST} o={o} r={.53}/></mesh>}
function TorqueConverter({o}:{o:number}){const pts=useMemo(()=>[
 new THREE.Vector2(.2,-.38),new THREE.Vector2(.72,-.37),new THREE.Vector2(.9,-.27),new THREE.Vector2(1.02,-.08),new THREE.Vector2(1.03,.1),new THREE.Vector2(.94,.27),new THREE.Vector2(.76,.37),new THREE.Vector2(.2,.39)
],[]);return <group position={[-2.2,.02,0]}>
 <mesh rotation={axial}><latheGeometry args={[pts,64]}/><Mat c="#383d40" o={o} m={.78} r={.32}/></mesh>
 <mesh position={[-.48,0,0]} rotation={axial}><cylinderGeometry args={[.17,.17,.62,28]}/><Mat c="#b2b6b8" o={o} m={.92} r={.22}/></mesh>
 <mesh position={[-.3,0,0]} rotation={axial}><torusGeometry args={[.66,.04,10,54]}/><Mat c="#666c70" o={o}/></mesh>
 </group>}
function Shell({exploded}:{exploded:boolean}){const o=exploded?.16:1;const pan=useMemo(panShape,[]),ps=useMemo(()=>({depth:.2,bevelEnabled:true,bevelSegments:2,bevelSize:.05,bevelThickness:.04,steps:1}),[]);return <group>
 <Bell o={o}/><TorqueConverter o={o}/>
 <CaseBlock x={-1.42} d={.9} w={1.12} h={1.14} o={o}/><CaseBlock x={-.58} d={.86} w={1.04} h={1.08} o={o}/><CaseBlock x={.23} d={.8} w={.96} h={1.0} o={o}/><CaseBlock x={.95} d={.68} w={.84} h={.9} o={o}/>
 {[-1.56,-1.15,-.72,-.29,.18,.66,1.02].map((x,i)=><mesh key={x} position={[x,.03,0]} rotation={axial}><torusGeometry args={[1.04-i*.035,.038,10,48]}/><Mat c="#52595d" o={o}/></mesh>)}
 {[-1.3,-.82,-.34,.14,.62].map((x,i)=><group key={x}><mesh position={[x,.92-i*.025,0]}><boxGeometry args={[.08,.18,1.58-i*.08]}/><Mat c="#555c60" o={o}/></mesh><mesh position={[x,-.82+i*.02,0]}><boxGeometry args={[.08,.14,1.44-i*.08]}/><Mat c="#555c60" o={o}/></mesh></group>)}
 <mesh position={[-.25,-1.23,0]} rotation={[Math.PI/2,0,0]}><extrudeGeometry args={[pan,ps]}/><Mat c={BLACK} o={o} m={.35} r={.7}/></mesh>
 <mesh position={[1.48,.02,0]} rotation={axial}><cylinderGeometry args={[.71,.82,.72,48]}/><Mat c="#686f72" o={o}/></mesh><mesh position={[2.02,.02,0]} rotation={axial}><cylinderGeometry args={[.49,.68,.63,42]}/><Mat c="#596064" o={o}/></mesh><mesh position={[2.45,.02,0]} rotation={axial}><cylinderGeometry args={[.31,.45,.35,34]}/><Mat c="#4d5458" o={o}/></mesh>
 <mesh position={[2.73,.02,0]} rotation={axial}><cylinderGeometry args={[.15,.15,.6,24]}/><Mat c="#252a2e" o={o}/></mesh>
 </group>}

function SplineShaft({len=.8,r=.16,on=false}:{len?:number,r?:number,on?:boolean}){return <group><mesh rotation={axial}><cylinderGeometry args={[r,r,len,24]}/><Mat c="#8f9699" on={on} m={.92} r={.25}/></mesh>{Array.from({length:12}).map((_,i)=>{const a=i/12*Math.PI*2;return <mesh key={i} position={[0,Math.cos(a)*(r+.025),Math.sin(a)*(r+.025)]} rotation={axial}><boxGeometry args={[len,.035,.035]}/><Mat c="#c3c7c9" on={on} m={.95} r={.18}/></mesh>})}</group>}
function ClutchPack({n=7,r=.7,spacing=.075,on=false}:{n?:number,r?:number,spacing?:number,on?:boolean}){return <group>{Array.from({length:n}).map((_,i)=><mesh key={i} position={[(i-(n-1)/2)*spacing,0,0]} rotation={axial}><torusGeometry args={[r,i%2?.033:.045,10,46]}/><Mat c={i%2?STEEL:FRICTION} on={on} m={i%2?.94:.18} r={i%2?.27:.82}/></mesh>)}</group>}
function ExternalLugs({r=.9,n=12,len=.72,w=.07,on=false}:{r?:number,n?:number,len?:number,w?:number,on?:boolean}){return <>{Array.from({length:n}).map((_,i)=>{const a=i/n*Math.PI*2;return <mesh key={i} position={[0,Math.cos(a)*r,Math.sin(a)*r]} rotation={[a,0,0]}><boxGeometry args={[len,w,.16]}/><Mat c="#656c70" on={on}/></mesh>})}</>}
function SteppedDrum({r=.9,len=.8,on=false,lugs=12}:{r?:number,len?:number,on?:boolean,lugs?:number}){const pts=useMemo(()=>[
 new THREE.Vector2(r*.36,-len/2),new THREE.Vector2(r*.75,-len/2),new THREE.Vector2(r*.9,-len*.34),new THREE.Vector2(r,-len*.2),new THREE.Vector2(r,len*.33),new THREE.Vector2(r*.92,len/2),new THREE.Vector2(r*.38,len/2)
],[r,len]);return <group>
 <mesh rotation={axial}><latheGeometry args={[pts,56]}/><Mat c="#646b6f" on={on} r={.36}/></mesh>
 <ExternalLugs r={r*1.01} n={lugs} len={len*.84} w={.055} on={on}/>
 <mesh position={[-len*.42,0,0]} rotation={axial}><torusGeometry args={[r*.78,.085,12,50]}/><Mat c={STEEL} on={on}/></mesh>
 </group>}
function Gear({r=.35,teeth=16,width=.25,on=false,c="#9ba1a4"}:{r?:number,teeth?:number,width?:number,on?:boolean,c?:string}){return <group><mesh rotation={axial}><cylinderGeometry args={[r*.82,r*.82,width,teeth*2]}/><Mat c={c} on={on} m={.9} r={.25}/></mesh>{Array.from({length:teeth}).map((_,i)=>{const a=i/teeth*Math.PI*2;return <mesh key={i} position={[0,Math.cos(a)*r,Math.sin(a)*r]} rotation={[a,0,0]}><boxGeometry args={[width,.1,r*.18]}/><Mat c={c} on={on} m={.9} r={.24}/></mesh>})}</group>}
function Pump({on}:{on:boolean}){return <group>
 <mesh rotation={axial}><cylinderGeometry args={[1.0,1.0,.2,56]}/><Mat c="#7f8689" on={on}/></mesh>
 <mesh position={[-.17,0,0]} rotation={axial}><cylinderGeometry args={[.74,.84,.32,48]}/><Mat c={STEEL} on={on} m={.9} r={.28}/></mesh>
 {Array.from({length:9}).map((_,i)=>{const a=i/9*Math.PI*2;return <mesh key={i} position={[-.13,Math.cos(a)*.55,Math.sin(a)*.55]} rotation={[a,0,0]}><boxGeometry args={[.14,.46,.08]}/><Mat c="#596064" on={on}/></mesh>})}
 <SplineShaft len={1.05} r={.17} on={on}/><BoltRing r={.84} n={10}/>
 </group>}
function FrontDrum({on}:{on:boolean}){return <group><SteppedDrum r={.94} len={.94} on={on} lugs={14}/><group position={[-.19,0,0]}><ClutchPack n={7} r={.66} spacing={.065} on={on}/></group><group position={[.25,0,0]}><ClutchPack n={5} r={.57} spacing={.065} on={on}/></group><mesh position={[-.46,0,0]} rotation={axial}><torusGeometry args={[.53,.12,12,46]}/><Mat c="#2a2f33" on={on}/></mesh><SplineShaft len={1.35} r={.14} on={on}/></group>}
function FourFiveSix({on}:{on:boolean}){return <group><SteppedDrum r={.78} len={.68} on={on} lugs={10}/><ClutchPack n={7} r={.54} spacing={.062} on={on}/><Gear r={.31} teeth={18} width={.48} on={on} c="#737a7e"/><SplineShaft len={1.0} r={.13} on={on}/></group>}
function CenterSupport({on}:{on:boolean}){return <group><mesh rotation={axial}><torusGeometry args={[.76,.15,14,54]}/><Mat c="#6d7477" on={on}/></mesh><ExternalLugs r={.91} n={8} len={.22} w={.12} on={on}/><ClutchPack n={6} r={.58} spacing={.066} on={on}/><mesh rotation={axial}><cylinderGeometry args={[.36,.36,.32,32]}/><Mat c="#353b3f" on={on}/></mesh></group>}
function LowReverse({on}:{on:boolean}){return <group><mesh rotation={axial}><torusGeometry args={[.72,.14,14,52]}/><Mat c="#6f7679" on={on}/></mesh><ExternalLugs r={.86} n={10} len={.3} w={.09} on={on}/><ClutchPack n={5} r={.57} spacing={.068} on={on}/>{Array.from({length:12}).map((_,i)=>{const a=i/12*Math.PI*2;return <mesh key={i} position={[.18,Math.cos(a)*.42,Math.sin(a)*.42]} rotation={[a,0,0]}><boxGeometry args={[.18,.08,.18]}/><Mat c="#252a2d" on={on}/></mesh>})}</group>}
function Planetary({on}:{on:boolean}){return <group>
 <Gear r={.78} teeth={28} width={.34} on={on} c="#a7adaf"/>
 <Gear r={.24} teeth={14} width={.46} on={on} c="#bfc4c6"/>
 {[0,1,2,3,4].map(i=>{const a=i/5*Math.PI*2;return <group key={i} position={[0,Math.cos(a)*.46,Math.sin(a)*.46]}><Gear r={.15} teeth={10} width={.34} on={on} c="#5a6165"/></group>})}
 {[0,1,2,3,4].map(i=>{const a=i/5*Math.PI*2;return <mesh key={'arm'+i} position={[-.2,Math.cos(a)*.25,Math.sin(a)*.25]} rotation={[a,0,0]}><boxGeometry args={[.16,.55,.09]}/><Mat c="#454c50" on={on}/></mesh>})}
 <SplineShaft len={1.7} r={.12} on={on}/>
 </group>}
function Valve({on}:{on:boolean}){const s=useMemo(valveShape,[]),set=useMemo(()=>({depth:.22,bevelEnabled:true,bevelSegments:2,bevelSize:.045,bevelThickness:.035,steps:1}),[]);return <group><mesh rotation={[Math.PI/2,0,0]}><extrudeGeometry args={[s,set]}/><Mat c="#838a8d" on={on} r={.56}/></mesh>{[-1.42,-1.02,-.62,-.18,.28,.7,1.08,1.42].map((x,i)=><mesh key={x} position={[x,.18,i%2?.28:-.24]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.07,.07,.34,16]}/><Mat c="#30363a" on={on}/></mesh>)}{[-1.15,-.62,-.08,.46,.98].map((x,i)=><mesh key={'rail'+x} position={[x,.2,i%2?.18:-.14]}><boxGeometry args={[.05,.08,.72]}/><Mat c="#4c5356" on={on}/></mesh>)}</group>}
function Tehcm({on}:{on:boolean}){return <group><mesh><boxGeometry args={[1.62,.32,.95]}/><Mat c="#171b1e" on={on} m={.15} r={.7}/></mesh><mesh position={[.16,.2,.02]}><boxGeometry args={[.9,.11,.58]}/><Mat c="#2b3034" on={on} m={.2} r={.65}/></mesh>{[-.66,-.42,-.18,.06,.3,.54].map((x,i)=><group key={x} position={[x,-.2,.49]}><mesh rotation={axial}><cylinderGeometry args={[.08,.08,.36,16]}/><Mat c="#0a0c0e" on={on}/></mesh><mesh position={[.18,0,0]} rotation={axial}><cylinderGeometry args={[.06,.06,.1,14]}/><Mat c={i%2?'#6c7275':'#474d51'} on={on}/></mesh></group>)}</group>}

const A=[[-1.68,.03,0],[-.88,.02,0],[-.06,.02,0],[.62,.01,0],[1.18,.02,0],[1.72,.03,0],[-.1,-1.12,0],[.58,-1.42,.5]] as const
const E=[[-3.45,.08,0],[-2.18,.04,0],[-.72,.04,0],[.72,.01,0],[1.95,-.04,0],[3.2,.02,0],[-.12,-2.45,0],[.95,-2.88,.58]] as const
function Move({i,exploded,on,pick,children}:{i:number,exploded:boolean,on:boolean,pick:(i:number)=>void,children:ReactNode}){const ref=useRef<THREE.Group>(null);useFrame((_,d)=>{const g=ref.current;if(!g)return;const t=(exploded?E:A)[i];g.position.x=THREE.MathUtils.damp(g.position.x,t[0],6,d);g.position.y=THREE.MathUtils.damp(g.position.y,t[1],6,d);g.position.z=THREE.MathUtils.damp(g.position.z,t[2],6,d);const s=THREE.MathUtils.damp(g.scale.x,on?1.055:1,7,d);g.scale.setScalar(s)});return <group ref={ref} position={A[i]} onClick={(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();pick(i)}}>{children}</group>}

export default function TransmissionModel({exploded,active,pick}:{exploded:boolean,active:number,pick:(i:number)=>void}){return <group rotation={[.03,-.38,-.03]} scale={.88}><Shell exploded={exploded}/><Move i={0} exploded={exploded} on={active===0} pick={pick}><Pump on={active===0}/></Move><Move i={1} exploded={exploded} on={active===1} pick={pick}><FrontDrum on={active===1}/></Move><Move i={2} exploded={exploded} on={active===2} pick={pick}><FourFiveSix on={active===2}/></Move><Move i={3} exploded={exploded} on={active===3} pick={pick}><CenterSupport on={active===3}/></Move><Move i={4} exploded={exploded} on={active===4} pick={pick}><LowReverse on={active===4}/></Move><Move i={5} exploded={exploded} on={active===5} pick={pick}><Planetary on={active===5}/></Move><Move i={6} exploded={exploded} on={active===6} pick={pick}><Valve on={active===6}/></Move><Move i={7} exploded={exploded} on={active===7} pick={pick}><Tehcm on={active===7}/></Move></group>}
