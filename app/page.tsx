'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Float } from '@react-three/drei'
import * as THREE from 'three'

function Gearbox() {
  const g = useRef<THREE.Group>(null)
  useFrame((_, d) => { if (g.current) g.current.rotation.y += d * .18 })
  return <Float speed={1.2} rotationIntensity={.15} floatIntensity={.25}><group ref={g} rotation={[0.15,-0.5,0]}>
    <mesh><cylinderGeometry args={[1.35,1.65,2.4,48]} /><meshStandardMaterial color="#8b939c" metalness={.9} roughness={.28}/></mesh>
    <mesh position={[0,-1.45,0]}><cylinderGeometry args={[1.65,.85,.55,48]} /><meshStandardMaterial color="#707982" metalness={.9} roughness={.3}/></mesh>
    <mesh position={[0,1.35,0]}><torusGeometry args={[.92,.22,18,48]}/><meshStandardMaterial color="#a7adb3" metalness={1} roughness={.2}/></mesh>
  </group></Float>
}

function SkyArrival({ done }: { done: () => void }) {
  useEffect(() => { const t=setTimeout(done,3900); return()=>clearTimeout(t)},[done])
  return <motion.div className="arrival" initial={{opacity:1}} animate={{opacity:0}} transition={{delay:3.25,duration:.7}}>
    <motion.div className="earth" initial={{scale:.35,y:-360}} animate={{scale:4.8,y:500}} transition={{duration:3.4,ease:[.7,.02,.2,1]}} />
    <motion.div className="arrival-copy" initial={{opacity:0}} animate={{opacity:[0,1,1,0]}} transition={{duration:3.2,times:[0,.3,.75,1]}}><span>DALTON, GEORGIA</span><strong>TRANS-FORMERS</strong></motion.div>
  </motion.div>
}

export default function Home(){
 const [intro,setIntro]=useState(true)
 const {scrollYProgress}=useScroll(); const y=useTransform(scrollYProgress,[0,.35],[0,-90])
 return <main>
  {intro && <SkyArrival done={()=>setIntro(false)}/>} 
  <nav><div className="brand"><b>TRANS-FORMERS</b><small>TRANSMISSION & AUTO REPAIR</small></div><div className="links"><a href="#services">SERVICES</a><a href="#lab">6L80 LAB</a><a href="#contact">CONTACT</a></div><a className="call" href="tel:+17062784000">CALL THE SHOP</a></nav>
  <section className="hero">
   <div className="grid"/><motion.div className="heroCopy" style={{y}}><p className="eyebrow">DALTON, GEORGIA • FAMILY RUN</p><h1>WE DON'T<br/><i>GUESS.</i><br/>WE DIAGNOSE.</h1><p className="sub">Transmission rebuilding, diagnostics and complete auto repair. See what goes on inside your transmission before a wrench ever turns.</p><div className="actions"><a href="#lab" className="primary">EXPLORE A 6L80 →</a><a href="#contact" className="secondary">GET DIRECTIONS</a></div></motion.div>
   <div className="three"><Canvas camera={{position:[4,2.5,6],fov:40}}><ambientLight intensity={.7}/><directionalLight position={[4,6,3]} intensity={4}/><pointLight position={[-4,-2,2]} intensity={6} color="#df1515"/><Gearbox/><Environment preset="warehouse"/></Canvas><span className="modelTag">INTERACTIVE 3D • 6L80</span></div>
   <div className="shopFront"><div className="shopSign"><b>TRANS-FORMERS</b><span>TRANSMISSIONS</span></div><div className="doors"><i/><i/><i/><i/></div></div>
  </section>
  <section className="stats"><div><b>4.4★</b><span>GOOGLE RATING</span></div><div><b>233+</b><span>CUSTOMER REVIEWS</span></div><div><b>ALL MAKES</b><span>& MODELS</span></div><div><b>DALTON</b><span>GEORGIA</span></div></section>
  <section id="lab" className="lab"><p className="eyebrow">TRANSMISSION LAB / 001</p><h2>INSIDE THE <i>6L80</i></h2><p className="lead">A transmission isn't a black box. Explore the assemblies, clutch packs and hydraulic controls that make the GM 6L80 work.</p><div className="parts">{['PUMP & STATOR','1-2-3-4 / 3-5-R DRUM','4-5-6 CLUTCH','2-6 CLUTCH','PLANETARY GEARSETS','VALVE BODY / TEHCM'].map((x,i)=><motion.div key={x} whileHover={{y:-8}}><span>0{i+1}</span><b>{x}</b><p>Inspect assembly →</p></motion.div>)}</div></section>
  <section id="services" className="services"><div><p className="eyebrow">WHAT WE DO</p><h2>BUILT HERE.<br/>FIXED RIGHT.</h2></div><div className="serviceList"><p><b>01</b> Transmission Diagnostics</p><p><b>02</b> Complete Rebuilds</p><p><b>03</b> Valve Body & Electrical</p><p><b>04</b> Torque Converter Service</p><p><b>05</b> Complete Auto Repair</p></div></section>
  <footer id="contact"><h2>844 SHUGART RD.<br/><i>DALTON, GA 30720</i></h2><p>Trans-Formers Transmission & Complete Auto Repair Specialist</p><a href="https://maps.google.com/?q=844+Shugart+Rd+Dalton+GA+30720">OPEN IN MAPS →</a></footer>
 </main>
}
