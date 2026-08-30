'use client'

import { useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Canvas, ThreeEvent, useFrame } from '@react-three/fiber'
import { Environment, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

type PartInfo = { name:string; short:string; role:string; failures:string[]; symptoms:string[]; checks:string[] }

const PARTS: PartInfo[] = [
  {name:'PUMP & STATOR SUPPORT',short:'Front hydraulic pump and stator support assembly.',role:'Creates line pressure and routes apply oil into the rotating clutch circuits while supporting converter oil flow.',failures:['Pump wear or pressure loss','Stator-support gasket or sealing leakage','Damaged sealing rings or bushings'],symptoms:['Delayed engagement','Low or erratic line pressure','Multiple clutch slip or converter concerns'],checks:['Verify commanded vs actual line pressure','Air-check clutch feeds','Inspect pump faces, stator support and sealing areas']},
  {name:'3-5-R / 1-2-3-4 DRUM',short:'Large front rotating drum containing two major clutch systems.',role:'Carries the 3-5-Reverse and 1-2-3-4 clutch elements. Damage or leakage here can affect several forward ranges and Reverse.',failures:['Drum weld or snap-ring issues','Piston/seal leakage','Burned frictions and steels'],symptoms:['No or slipping Reverse','Shift flare','Wrong-gear starts or burned clutch material'],checks:['Air-check both circuits','Inspect welds and retention','Inspect pistons, seals, frictions and steels']},
  {name:'4-5-6 CLUTCH ASSEMBLY',short:'Upper-range rotating clutch drum and friction pack.',role:'Applies through the upper forward ranges. Clearance and feed sealing are critical to clean 4th, 5th and 6th gear operation.',failures:['Burned 4-5-6 frictions','Incorrect clutch clearance','Compensator-feed or sealing-ring leakage'],symptoms:['Slip or flare in upper gears','Bind after rebuild','Overheated 4-5-6 clutch pack'],checks:['Measure clutch clearance','Air-check apply circuit','Inspect turbine-shaft seals, piston and backing hardware']},
  {name:'CENTER SUPPORT / 2-6 CLUTCH',short:'Stationary center support with the 2-6 clutch section.',role:'Supports the middle of the geartrain and carries stationary clutch elements that react torque into the case.',failures:['Support seal leakage','Burned 2-6 frictions','Piston or apply-circuit leakage'],symptoms:['2nd or 6th gear slip','1-2 or 5-6 flare','Ratio codes or poor shift quality'],checks:['Air-check 2-6 apply','Inspect support seals and bores','Inspect frictions, steels and piston seals']},
  {name:'LOW / REVERSE CLUTCH',short:'Rear stationary holding clutch used in Reverse and low-range operation.',role:'Anchors part of the geartrain during Reverse and selected low-speed conditions and must release correctly during transitions.',failures:['Apply leakage','Burned clutch material','Hydraulic feed or checkball issues'],symptoms:['Weak or delayed Reverse contribution','Engine-braking complaints','Bind or harsh low-range engagement'],checks:['Air-check Low/Reverse circuit','Inspect friction pack and seals','Verify related hydraulic feed paths']},
  {name:'REAR PLANETARY / OUTPUT CARRIER',short:'Rear planetary gearset and output carrier.',role:'Combines ring, sun and planet members to create ratio changes and transmit torque to the output shaft.',failures:['Pinion or needle-bearing wear','Gear tooth damage','Lubrication or thrust failure'],symptoms:['Geartrain noise','Ratio errors','Metal debris or loss of drive'],checks:['Inspect pinions and gear teeth','Check thrust surfaces and bearings','Inspect lubrication passages and debris']},
  {name:'VALVE BODY',short:'Cast-aluminum hydraulic control body mounted above the pan.',role:'Meters and routes regulated pressure through clutch, converter and select circuits according to commanded operation.',failures:['Regulator bore wear','Sticking valves','Checkball or separator-plate wear'],symptoms:['Flares, harsh shifts or bind','No Forward or Reverse with pressure present','Burned clutches from poor apply control'],checks:['Vacuum-test suspect bores','Inspect plate and checkballs','Verify valve movement and hydraulic integrity']},
  {name:'TEHCM / SOLENOID BODY',short:'Integrated transmission controller and solenoid body.',role:'Combines transmission control electronics with pressure-control and shift solenoids and monitors transmission inputs.',failures:['Solenoid performance faults','Pressure-switch/internal circuit faults','Electrical or communication problems'],symptoms:['Harsh shifting or failsafe','Solenoid/pressure-control codes','TCC or shift timing complaints'],checks:['Review scan data','Perform circuit/solenoid tests','Confirm power, ground, communication and speed inputs']}
]

const RED='#d71920', CASE='#73797c', DARK='#181b1d', STEEL='#b7bbbd', FRICTION='#292725'
const material=(c:string,active=false,m=.82,r=.36,opacity=1)=><meshStandardMaterial color={active?RED:c} metalness={m} roughness={r} transparent={opacity<1} opacity={opacity}/>

function Frictions({count=7,radius=.86}:{count?:number;radius?:number}){
  return <group>{Array.from({length:count}).map((_,i)=><mesh key={i} position={[(i-(count-1)/2)*.075,0,0]} rotation={[0,0,Math.PI/2]}><torusGeometry args={[radius,.045,10,48]}/>{material(i%2?STEEL:FRICTION,false,i%2?.95:.25,i%2?.22:.7)}</mesh>)}</group>
}

function Planetary({active}:{active:boolean}){
  return <group>
    <mesh rotation={[0,0,Math.PI/2]}><torusGeometry args={[.9,.11,16,56]}/>{material('#8d9498',active)}</mesh>
    {[0,1,2,3,4].map(i=>{const a=i/5*Math.PI*2; return <mesh key={i} position={[0,Math.cos(a)*.56,Math.sin(a)*.56]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.19,.19,.34,20]}/>{material('#3d4245',active)}</mesh>})}
    <mesh rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.26,.26,.9,28]}/>{material('#24282a',active)}</mesh>
  </group>
}

function CaseShell({exploded}:{exploded:boolean}){
  const o=exploded?.16:1
  return <group>
    <mesh position={[-2.25,0,0]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[1.72,1.34,.72,64,1,true]}/>{material(CASE,false,.68,.52,o)}</mesh>
    <mesh position={[-2.62,0,0]} rotation={[0,0,Math.PI/2]}><torusGeometry args={[1.7,.12,16,64]}/>{material('#666c6f',false,.7,.48,o)}</mesh>
    <mesh position={[-2.72,0,0]} rotation={[0,0,Math.PI/2]}><torusGeometry args={[1.17,.16,16,64]}/>{material('#4d5356',false,.75,.45,o)}</mesh>
    <mesh position={[-.55,0,0]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[1.28,1.38,2.75,64]}/>{material(CASE,false,.72,.5,o)}</mesh>
    {[ -1.55,-.95,-.35,.25,.85 ].map((x,i)=><mesh key={x} position={[x,0,0]} rotation={[0,0,Math.PI/2]}><torusGeometry args={[1.29-i*.018,.055,10,58]}/>{material('#555b5e',false,.72,.48,o)}</mesh>)}
    <mesh position={[1.45,0,0]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[1.06,1.24,1.25,56]}/>{material('#6b7174',false,.72,.5,o)}</mesh>
    <mesh position={[2.42,0,0]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.72,.98,.95,52]}/>{material('#656b6e',false,.74,.48,o)}</mesh>
    <mesh position={[2.95,0,0]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.56,.68,.55,46]}/>{material('#5b6164',false,.74,.46,o)}</mesh>
    <mesh position={[-.55,-1.34,0]}><boxGeometry args={[3.35,.34,2.05]}/>{material('#35393b',false,.58,.5,o)}</mesh>
    {Array.from({length:10}).map((_,i)=>{const a=i/10*Math.PI*2;return <mesh key={i} position={[-2.63,Math.cos(a)*1.68,Math.sin(a)*1.68]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.065,.065,.2,12]}/>{material('#34383a',false,.7,.5,o)}</mesh>})}
  </group>
}

function ValveBody({active,tehcm}:{active:boolean;tehcm:boolean}){
 return <group><mesh><boxGeometry args={[3.7,.28,1.7]}/>{material('#777d80',active,.72,.48)}</mesh>{[-1.45,-.95,-.45,.05,.55,1.05,1.45].map((x,i)=><mesh key={x} position={[x,.22,i%2?.38:-.3]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.1,.1,.46,18]}/>{material('#303538',tehcm)}</mesh>)}</group>
}

function Transmission({exploded,activePart,setActivePart}:{exploded:boolean;activePart:number;setActivePart:(n:number)=>void}){
 const root=useRef<THREE.Group>(null), refs=useRef<(THREE.Group|null)[]>([]), p=useRef(exploded?1:0)
 const base=[-1.95,-1.2,-.38,.46,1.2,2.0], spread=[-2.4,-1.55,-.8,.55,1.35,2.15]
 useFrame((_,d)=>{p.current=THREE.MathUtils.damp(p.current,exploded?1:0,4,d);refs.current.forEach((g,i)=>{if(g)g.position.x=THREE.MathUtils.damp(g.position.x,base[i]+spread[i]*p.current+(activePart===i?.25:0),6,d)});if(root.current)root.current.rotation.y+=d*.025})
 const click=(i:number)=>(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();setActivePart(i)}
 return <group ref={root} rotation={[.03,-.2,-.06]} scale={.86}>
   <CaseShell exploded={exploded}/>
   <group ref={e=>{refs.current[0]=e}} position={[base[0],0,0]} onClick={click(0)}><mesh rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[1.18,1.02,.34,56]}/>{material('#848a8d',activePart===0)}</mesh><mesh position={[-.22,0,0]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.43,.43,.75,40]}/>{material(DARK,activePart===0)}</mesh></group>
   <group ref={e=>{refs.current[1]=e}} position={[base[1],0,0]} onClick={click(1)}><mesh rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[1.05,1.05,.85,56]}/>{material('#666d70',activePart===1)}</mesh><Frictions count={8} radius={.82}/></group>
   <group ref={e=>{refs.current[2]=e}} position={[base[2],0,0]} onClick={click(2)}><mesh rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.98,.98,.7,52]}/>{material('#596064',activePart===2)}</mesh><Frictions count={7} radius={.76}/></group>
   <group ref={e=>{refs.current[3]=e}} position={[base[3],0,0]} onClick={click(3)}><mesh rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[1.03,.96,.54,52]}/>{material('#787f83',activePart===3)}</mesh><Frictions count={6} radius={.79}/></group>
   <group ref={e=>{refs.current[4]=e}} position={[base[4],0,0]} onClick={click(4)}><mesh rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[1.0,1.0,.42,50]}/>{material('#60676a',activePart===4)}</mesh><Frictions count={5} radius={.78}/></group>
   <group ref={e=>{refs.current[5]=e}} position={[base[5],0,0]} onClick={click(5)}><Planetary active={activePart===5}/><mesh position={[.62,0,0]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.25,.25,1.25,30]}/>{material('#25292b',activePart===5)}</mesh></group>
   <group position={[0,-2.05-p.current*.95,0]} onClick={click(6)}><ValveBody active={activePart===6} tehcm={activePart===7}/></group>
 </group>
}

export default function Home(){
 const [exploded,setExploded]=useState(false),[activePart,setActivePart]=useState(0); const active=useMemo(()=>PARTS[activePart],[activePart])
 return <main>
   <nav><a className="brand" href="#top"><b>TRANS-FORMERS</b><small>TRANSMISSION & COMPLETE AUTO REPAIR</small></a><div className="links"><a href="#services">SERVICES</a><a href="#lab">TRANSMISSION LAB</a><a href="#contact">CONTACT</a></div><a className="call" href="tel:+17065292706">CALL (706) 529-2706</a></nav>
   <section id="top" className="photoHero"><img className="heroPhoto" src="/shop-front-ai.webp?v=4" alt="Trans-Formers Transmission shop exterior"/><div className="heroShade"/><motion.div className="photoHeroCopy" initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{duration:.75}}><p className="eyebrow">DALTON, GEORGIA • FAMILY OWNED</p><h1>BUILT.<br/><i>REBUILT.</i><br/>BACK ON THE ROAD.</h1><p className="sub">Transmission rebuilding, diagnostics and complete auto repair for all makes and models.</p><div className="actions"><a href="#services" className="primary">OUR SERVICES</a><a href="#lab" className="secondary">OPEN 6L80 LAB →</a></div></motion.div><div className="heroBadge"><span>844</span><b>SHUGART RD</b><small>DALTON, GA 30720</small></div></section>
   <section className="stats"><div><b>TRANSMISSIONS</b><span>REBUILD • REPAIR • DIAGNOSE</span></div><div><b>ALL MAKES</b><span>DOMESTIC • IMPORT</span></div><div><b>IN-HOUSE</b><span>DIAGNOSIS & REBUILDING</span></div><div><b>DALTON</b><span>GEORGIA</span></div></section>
   <section id="lab" className="lab labV2"><div className="labHeading"><p className="eyebrow">6L80 INTERACTIVE RECONSTRUCTION</p><h2>SEE WHAT'S<br/><i>INSIDE.</i></h2><p className="lead">A detailed original 6L80 reconstruction with a recognizable bellhousing, main case, pan, extension housing and separated internal assemblies.</p><button className="explodeButton" onClick={()=>setExploded(!exploded)}>{exploded?'ASSEMBLE TRANSMISSION':'EXPLODE TRANSMISSION'}</button></div>
   <div className="labStage"><Canvas camera={{position:[0.4,2.7,9.6],fov:38}} dpr={[1,1.5]}><ambientLight intensity={.7}/><directionalLight position={[4,7,5]} intensity={2.2}/><directionalLight position={[-4,2,-3]} intensity={1.1}/><Transmission exploded={exploded} activePart={activePart} setActivePart={setActivePart}/><Environment preset="warehouse"/><OrbitControls enablePan={false} minDistance={6} maxDistance={13} target={[0,-.2,0]}/></Canvas><div className="labHud"><span>DRAG TO ROTATE</span><span>SCROLL / PINCH TO ZOOM</span><strong>{exploded?'EXPLODED VIEW':'ASSEMBLED VIEW'}</strong></div></div>
   <div className="componentPanel">{PARTS.map((x,i)=><button key={x.name} className={activePart===i?'active':''} onClick={()=>setActivePart(i)}><span>{String(i+1).padStart(2,'0')}</span><b>{x.name}</b><i>VIEW</i></button>)}</div>
   <div className="partDetail"><span>SELECTED ASSEMBLY</span><h3>{active.name}</h3><p>{active.short}</p><div className="researchGrid"><div><b>WHAT IT DOES</b><p>{active.role}</p></div><div><b>COMMON FAILURES</b><ul>{active.failures.map(x=><li key={x}>{x}</li>)}</ul></div><div><b>WHAT THE DRIVER MAY NOTICE</b><ul>{active.symptoms.map(x=><li key={x}>{x}</li>)}</ul></div><div><b>WHAT A TECH CHECKS</b><ul>{active.checks.map(x=><li key={x}>{x}</li>)}</ul></div></div></div></section>
   <section id="services" className="services"><div><p className="eyebrow">WHAT WE DO</p><h2>TRANSMISSION<br/><i>SPECIALISTS.</i></h2><p className="lead">Diagnosis, rebuilding and complete auto repair with the focus on finding the cause instead of firing the parts cannon.</p></div><div className="serviceList"><p><b>01</b> Transmission Diagnostics</p><p><b>02</b> Transmission Rebuilding</p><p><b>03</b> Valve Body & Solenoid Repair</p><p><b>04</b> Torque Converter Service</p><p><b>05</b> Complete Auto Repair</p></div></section>
   <footer id="contact"><h2>READY TO GET IT<br/><i>FIXED RIGHT?</i></h2><p>844 Shugart Rd, Dalton, GA 30720 • (706) 529-2706</p><div className="footerActions"><a href="tel:+17065292706">CALL THE SHOP</a><a href="https://maps.google.com/?q=844+Shugart+Rd+Dalton+GA+30720">GET DIRECTIONS</a></div></footer>
 </main>
}
