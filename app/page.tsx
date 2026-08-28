'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

const PARTS = [
  'PUMP ASSEMBLY',
  'INPUT CARRIER',
  '1-2-3-4 / 3-5-R CLUTCH',
  '4-5-6 CLUTCH',
  '2-6 CLUTCH',
  'LOW / REVERSE CLUTCH',
  'OUTPUT CARRIER',
  'VALVE BODY / TEHCM',
]

function Exploded6L80({ exploded }: { exploded: boolean }) {
  const group = useRef<THREE.Group>(null)
  const progress = useRef(0)

  useFrame((_, delta) => {
    progress.current = THREE.MathUtils.damp(progress.current, exploded ? 1 : 0.28, 3.4, delta)
    if (group.current) group.current.rotation.y += delta * 0.08
  })

  const x = (assembled: number, explodedX: number) => assembled + explodedX * progress.current
  const metal = '#72777b'
  const dark = '#1b1e21'
  const black = '#08090a'

  return (
    <group ref={group} rotation={[0.12, -0.34, -0.18]} scale={0.88}>
      <group position={[x(-2.25, -1.55), 0, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[1.55, 1.15, 0.42, 48]} />
          <meshStandardMaterial color={dark} metalness={0.95} roughness={0.24} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[1.05, 0.12, 18, 48]} />
          <meshStandardMaterial color={metal} metalness={1} roughness={0.2} />
        </mesh>
      </group>

      <group position={[x(-1.45, -1.0), 0, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[1.12, 1.12, 0.64, 48]} />
          <meshStandardMaterial color={metal} metalness={0.95} roughness={0.28} />
        </mesh>
        {[0.78, 0.96].map((r) => (
          <mesh key={r} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[r, 0.055, 12, 48]} />
            <meshStandardMaterial color={black} metalness={0.8} roughness={0.3} />
          </mesh>
        ))}
      </group>

      <group position={[x(-0.62, -0.48), 0, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[1.28, 1.28, 0.72, 48]} />
          <meshStandardMaterial color={dark} metalness={0.9} roughness={0.3} />
        </mesh>
        {[-0.22, 0, 0.22].map((p) => (
          <mesh key={p} position={[p, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[1.12, 0.045, 10, 48]} />
            <meshStandardMaterial color="#b8bcc0" metalness={1} roughness={0.2} />
          </mesh>
        ))}
      </group>

      <group position={[x(0.26, 0.08), 0, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[1.16, 1.16, 0.78, 48]} />
          <meshStandardMaterial color={metal} metalness={1} roughness={0.25} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.86, 0.07, 14, 48]} />
          <meshStandardMaterial color="#d2232a" emissive="#5a0709" emissiveIntensity={0.45} metalness={0.7} roughness={0.28} />
        </mesh>
      </group>

      <group position={[x(1.13, 0.62), 0, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[1.34, 1.16, 0.74, 48]} />
          <meshStandardMaterial color={dark} metalness={0.92} roughness={0.28} />
        </mesh>
        {[-0.24, 0, 0.24].map((p) => (
          <mesh key={p} position={[p, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[1.12, 0.05, 10, 48]} />
            <meshStandardMaterial color="#a6aaad" metalness={1} roughness={0.2} />
          </mesh>
        ))}
      </group>

      <group position={[x(2.05, 1.22), 0, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[1.04, 1.28, 0.58, 48]} />
          <meshStandardMaterial color={metal} metalness={0.96} roughness={0.27} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.35, 0.35, 1.75, 32]} />
          <meshStandardMaterial color={black} metalness={0.8} roughness={0.22} />
        </mesh>
      </group>

      <group position={[0, -1.86 - progress.current * 0.9, 0.1]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <boxGeometry args={[3.8, 1.5, 0.24]} />
          <meshStandardMaterial color={black} metalness={0.72} roughness={0.34} />
        </mesh>
        {[ -1.45, -0.85, -0.25, 0.35, 0.95, 1.45 ].map((p) => (
          <mesh key={p} position={[p, 0.22, 0]}>
            <cylinderGeometry args={[0.13, 0.13, 0.42, 20]} />
            <meshStandardMaterial color="#2f3336" metalness={0.85} roughness={0.3} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

export default function Home() {
  const [exploded, setExploded] = useState(true)
  const [activePart, setActivePart] = useState(0)

  return (
    <main>
      <nav>
        <a className="brand" href="#top"><b>TRANS-FORMERS</b><small>TRANSMISSION & COMPLETE AUTO REPAIR</small></a>
        <div className="links"><a href="#services">SERVICES</a><a href="#lab">TRANSMISSION LAB</a><a href="#contact">CONTACT</a></div>
        <a className="call" href="tel:+17065292706">CALL (706) 529-2706</a>
      </nav>

      <section id="top" className="photoHero">
        <div className="heroPhoto" role="img" aria-label="Trans-Formers Transmission shop exterior" />
        <div className="heroShade" />
        <motion.div className="photoHeroCopy" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75 }}>
          <p className="eyebrow">DALTON, GEORGIA • FAMILY OWNED</p>
          <h1>BUILT.<br /><i>REBUILT.</i><br />BACK ON THE ROAD.</h1>
          <p className="sub">Transmission rebuilding, diagnostics and complete auto repair for all makes and models. No cartoon building. The shop itself is the first thing you see.</p>
          <div className="actions"><a href="#services" className="primary">OUR SERVICES</a><a href="#lab" className="secondary">OPEN 6L80 LAB →</a></div>
        </motion.div>
        <div className="heroBadge"><span>844</span><b>SHUGART RD.</b><small>DALTON, GA</small></div>
      </section>

      <section className="stats">
        <div><b>40+ YEARS</b><span>TRANSMISSION EXPERIENCE</span></div>
        <div><b>ALL MAKES</b><span>& MODELS</span></div>
        <div><b>REBUILDS</b><span>DONE IN-HOUSE</span></div>
        <div><b>DALTON</b><span>GEORGIA</span></div>
      </section>

      <section id="lab" className="lab labV2">
        <div className="labHeading">
          <p className="eyebrow">INTERACTIVE TRANSMISSION LAB / 001</p>
          <h2>EXPLORE THE <i>6L80</i></h2>
          <p className="lead">The outside stays photorealistic. Inside the transmission, we can animate the assemblies so customers can actually see what gets rebuilt. This starter model is intentionally approximate while we build the mechanically accurate version.</p>
          <button className="explodeButton" onClick={() => setExploded((v) => !v)}>{exploded ? 'ASSEMBLE 6L80' : 'EXPLODE 6L80'}</button>
        </div>

        <div className="labStage">
          <Canvas camera={{ position: [0, 2.6, 10], fov: 42 }}>
            <ambientLight intensity={0.75} />
            <directionalLight position={[5, 7, 5]} intensity={4.5} />
            <pointLight position={[-5, 1, 4]} intensity={5} color="#d2232a" />
            <pointLight position={[5, -2, 2]} intensity={3} color="#8e979d" />
            <Exploded6L80 exploded={exploded} />
            <Environment preset="warehouse" />
            <OrbitControls enablePan={false} minDistance={7} maxDistance={13} autoRotate={false} />
          </Canvas>
          <div className="labHud"><span>DRAG TO ROTATE</span><span>SCROLL TO ZOOM</span><strong>{exploded ? 'EXPLODED VIEW' : 'ASSEMBLED VIEW'}</strong></div>
        </div>

        <div className="componentPanel">
          {PARTS.map((part, index) => (
            <button key={part} className={activePart === index ? 'active' : ''} onClick={() => setActivePart(index)}>
              <span>{String(index + 1).padStart(2, '0')}</span><b>{part}</b><i>VIEW</i>
            </button>
          ))}
        </div>

        <div className="partDetail">
          <span>SELECTED COMPONENT</span>
          <h3>{PARTS[activePart]}</h3>
          <p>{activePart === 0 ? 'Front pump and stator support area. Hydraulic pressure begins here, feeding the circuits that apply clutches and control converter operation.' : activePart === 7 ? 'The control side of the unit. Solenoids and the TEHCM command pressure, shifts and converter clutch operation.' : 'This assembly is one piece of the 6L80 powerflow. The full version will isolate it, animate its relationship to the neighboring assemblies, and show common failure points.'}</p>
        </div>
      </section>

      <section id="services" className="services">
        <div><p className="eyebrow">WHAT WE DO</p><h2>TRANSMISSION<br /><i>SPECIALISTS.</i></h2><p className="lead">From diagnosis to complete remanufacturing, the point is to show customers what failed instead of handing them a mystery bill and a shrug.</p></div>
        <div className="serviceList"><p><b>01</b> Transmission Diagnostics</p><p><b>02</b> Complete Rebuilds</p><p><b>03</b> Valve Body & Electrical</p><p><b>04</b> Torque Converter Service</p><p><b>05</b> Complete Auto Repair</p></div>
      </section>

      <footer id="contact">
        <h2>844 SHUGART RD.<br /><i>DALTON, GA 30720</i></h2>
        <p>Trans-Formers Transmission & Complete Auto Repair Specialist</p>
        <div className="footerActions"><a href="tel:+17065292706">CALL (706) 529-2706</a><a href="https://maps.google.com/?q=844+Shugart+Rd+Dalton+GA+30720">OPEN IN MAPS →</a></div>
      </footer>
    </main>
  )
}
