'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Float } from '@react-three/drei'
import * as THREE from 'three'

function Gearbox() {
  const g = useRef<THREE.Group>(null)
  useFrame((_, d) => { if (g.current) g.current.rotation.y += d * .18 })
  return (
    <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.25}>
      <group ref={g} rotation={[0.15, -0.5, 0]}>
        <mesh>
          <cylinderGeometry args={[1.35, 1.65, 2.4, 48]} />
          <meshStandardMaterial color="#8b939c" metalness={0.9} roughness={0.28} />
        </mesh>
        <mesh position={[0, -1.45, 0]}>
          <cylinderGeometry args={[1.65, 0.85, 0.55, 48]} />
          <meshStandardMaterial color="#707982" metalness={0.9} roughness={0.3} />
        </mesh>
        <mesh position={[0, 1.35, 0]}>
          <torusGeometry args={[0.92, 0.22, 18, 48]} />
          <meshStandardMaterial color="#a7adb3" metalness={1} roughness={0.2} />
        </mesh>
      </group>
    </Float>
  )
}

function SkyArrival({ done }: { done: () => void }) {
  useEffect(() => {
    const t = setTimeout(done, 3900)
    return () => clearTimeout(t)
  }, [done])

  return (
    <motion.div className="arrival" initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ delay: 3.25, duration: 0.7 }}>
      <motion.div className="earth" initial={{ scale: 0.35, y: -360 }} animate={{ scale: 4.8, y: 500 }} transition={{ duration: 3.4, ease: [0.7, 0.02, 0.2, 1] }} />
      <motion.div className="arrival-copy" initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 1, 0] }} transition={{ duration: 3.2, times: [0, 0.3, 0.75, 1] }}>
        <span>COMING DOWN OVER DALTON, GEORGIA</span>
        <strong>TRANS-FORMERS</strong>
      </motion.div>
    </motion.div>
  )
}

function ShopFrontScene() {
  return (
    <div className="frontScene" aria-label="Front of Trans-Formers transmission shop">
      <div className="skyGlow" />
      <div className="roadLines"><span /><span /><span /></div>
      <motion.div className="buildingWrap" initial={{ y: 70, scale: 0.92, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} transition={{ delay: 3.6, duration: 0.9, ease: 'easeOut' }}>
        <div className="shopBuilding">
          <div className="roof" />
          <div className="redTrim" />
          <div className="mainSign"><b>TRANS-FORMERS</b><span>TRANSMISSION</span></div>
          <div className="bayRow"><i /><i /><i /><i /></div>
          <div className="officeBlock"><b>OFFICE</b><span>COMPLETE AUTO REPAIR</span></div>
          <div className="shopLights"><i /><i /><i /><i /><i /></div>
        </div>
        <div className="grass"><span>844 SHUGART RD</span></div>
        <div className="lot"><i /><i /><i /></div>
      </motion.div>
    </div>
  )
}

export default function Home() {
  const [intro, setIntro] = useState(true)
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 0.35], [0, -90])

  return (
    <main>
      {intro && <SkyArrival done={() => setIntro(false)} />}
      <nav>
        <div className="brand"><b>TRANS-FORMERS</b><small>TRANSMISSION & AUTO REPAIR</small></div>
        <div className="links"><a href="#services">SERVICES</a><a href="#lab">6L80 LAB</a><a href="#contact">CONTACT</a></div>
        <a className="call" href="tel:+17062784000">CALL THE SHOP</a>
      </nav>

      <section className="hero shopHero">
        <div className="grid" />
        <ShopFrontScene />
        <motion.div className="heroCopy shopCopy" style={{ y }}>
          <p className="eyebrow">FIRST STOP: THE FRONT OF THE SHOP</p>
          <h1>LAND AT<br /><i>TRANS-FORMERS.</i></h1>
          <p className="sub">The site opens with a sky-to-shop camera shot, landing in front of the Dalton building before taking visitors into the service bays and the 6L80 transmission lab.</p>
          <div className="actions"><a href="#lab" className="primary">CONTINUE TO 6L80 →</a><a href="#contact" className="secondary">GET DIRECTIONS</a></div>
        </motion.div>
      </section>

      <section className="stats">
        <div><b>4.4★</b><span>GOOGLE RATING</span></div>
        <div><b>233+</b><span>CUSTOMER REVIEWS</span></div>
        <div><b>ALL MAKES</b><span>& MODELS</span></div>
        <div><b>DALTON</b><span>GEORGIA</span></div>
      </section>

      <section id="lab" className="lab">
        <div className="labVisual">
          <Canvas camera={{ position: [4, 2.5, 6], fov: 40 }}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[4, 6, 3]} intensity={4} />
            <pointLight position={[-4, -2, 2]} intensity={6} color="#df1515" />
            <Gearbox />
            <Environment preset="warehouse" />
          </Canvas>
          <span className="modelTag">PLACEHOLDER MODEL • 6L80 SYSTEM</span>
        </div>
        <div>
          <p className="eyebrow">TRANSMISSION LAB / 001</p>
          <h2>INSIDE THE <i>6L80</i></h2>
          <p className="lead">A transmission isn't a black box. Explore the assemblies, clutch packs and hydraulic controls that make the GM 6L80 work.</p>
        </div>
        <div className="parts">{['PUMP & STATOR', '1-2-3-4 / 3-5-R DRUM', '4-5-6 CLUTCH', '2-6 CLUTCH', 'PLANETARY GEARSETS', 'VALVE BODY / TEHCM'].map((x, i) => <motion.div key={x} whileHover={{ y: -8 }}><span>0{i + 1}</span><b>{x}</b><p>Inspect assembly →</p></motion.div>)}</div>
      </section>

      <section id="services" className="services">
        <div><p className="eyebrow">WHAT WE DO</p><h2>BUILT HERE.<br />FIXED RIGHT.</h2></div>
        <div className="serviceList"><p><b>01</b> Transmission Diagnostics</p><p><b>02</b> Complete Rebuilds</p><p><b>03</b> Valve Body & Electrical</p><p><b>04</b> Torque Converter Service</p><p><b>05</b> Complete Auto Repair</p></div>
      </section>

      <footer id="contact">
        <h2>844 SHUGART RD.<br /><i>DALTON, GA 30720</i></h2>
        <p>Trans-Formers Transmission & Complete Auto Repair Specialist</p>
        <a href="https://maps.google.com/?q=844+Shugart+Rd+Dalton+GA+30720">OPEN IN MAPS →</a>
      </footer>
    </main>
  )
}
