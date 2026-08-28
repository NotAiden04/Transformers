'use client'

import { useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

type PartInfo = {
  name: string
  short: string
  role: string
  failures: string[]
  symptoms: string[]
  checks: string[]
}

const PARTS: PartInfo[] = [
  {
    name: 'PUMP & STATOR SUPPORT',
    short: 'Feeds hydraulic pressure and routes apply oil to rotating clutch assemblies.',
    role: 'The front pump creates line pressure. The stator support routes oil to the 1-2-3-4, 3-5-R and 4-5-6 clutch circuits and supports converter-related oil flow.',
    failures: ['Pump wear or pressure loss', 'Stator support sealing or gasket leakage', 'Damaged sealing rings or feed passages'],
    symptoms: ['Low or erratic line pressure', 'Multiple clutch slip complaints', 'Delayed engagement or converter concerns'],
    checks: ['Verify commanded vs. actual line pressure', 'Air-check clutch feed circuits', 'Inspect stator support sealing areas and pump surfaces'],
  },
  {
    name: '3-5-R / 1-2-3-4 DRUM',
    short: 'Shared rotating housing for two of the 6L80’s major apply clutch packs.',
    role: 'This drum carries the 3-5-Reverse and 1-2-3-4 clutch elements. These clutches are central to forward ranges and Reverse powerflow, so leakage or mechanical damage here can affect multiple gears.',
    failures: ['3-5-R drum weld or snap-ring issues', 'Piston or seal leakage', 'Burned friction elements from hydraulic loss'],
    symptoms: ['No or slipping Reverse', '2-3 or 4-5 flare', 'Wrong-gear starts, bind or burned clutches'],
    checks: ['Air-check both clutch circuits', 'Inspect drum welds and snap-ring retention', 'Inspect pistons, seals, frictions and steels'],
  },
  {
    name: '4-5-6 CLUTCH ASSEMBLY',
    short: 'Upper-range clutch used to carry torque in the high gears.',
    role: 'The 4-5-6 clutch is a rotating clutch assembly used in the upper forward gears. Proper clutch clearance and compensator-feed sealing are critical to clean shifts and clutch life.',
    failures: ['Burned 4-5-6 frictions', 'Incorrect clutch clearance', 'Compensator-feed or turbine-shaft sealing-ring leakage'],
    symptoms: ['Slip or flare in 4th, 5th or 6th', 'Bind during circuit charge after rebuild', 'Overheated or burned 4-5-6 clutch pack'],
    checks: ['Measure clutch clearance', 'Air-check apply circuit', 'Inspect turbine-shaft seals and related valve-body regulation'],
  },
  {
    name: 'CENTER SUPPORT / 2-6 CLUTCH',
    short: 'Stationary clutch section that helps establish 2nd and 6th gear powerflow.',
    role: 'The center support houses the 2-6 and Low/Reverse clutch sections. Unlike the rotating clutch drums, these elements are stationary and react torque through the case/support structure.',
    failures: ['Seal or piston leakage', 'Burned 2-6 frictions', 'Support or apply-circuit leakage'],
    symptoms: ['2nd or 6th gear slip', 'Shift flare involving 1-2 or 5-6 events', 'Ratio codes or poor shift quality'],
    checks: ['Air-check 2-6 apply', 'Inspect support sealing areas', 'Inspect frictions, steels and piston seals'],
  },
  {
    name: 'LOW / REVERSE CLUTCH',
    short: 'Stationary holding clutch used for Reverse and low-speed engine-braking conditions.',
    role: 'The Low/Reverse clutch anchors part of the geartrain during Reverse and selected low-range conditions. It is controlled hydraulically through the center-support and valve-body circuits.',
    failures: ['Apply leakage', 'Burned clutch material', 'Valve-body or checkball feed issues'],
    symptoms: ['Poor or delayed Reverse contribution', 'Engine-braking complaints', 'Harsh or inconsistent low-range engagement'],
    checks: ['Air-check Low/Reverse circuit', 'Inspect clutch pack and seals', 'Verify related valve-body feed and checkball condition'],
  },
  {
    name: 'REAR PLANETARY / OUTPUT CARRIER',
    short: 'Planetary geartrain that creates the transmission’s ratio changes and sends torque to the output.',
    role: 'The rear geartrain combines carriers, sun gears and ring gears to create the six forward ratios and Reverse when different clutch elements hold or drive sections of the planetary sets.',
    failures: ['Planet pin or bearing wear', 'Damaged gear teeth', 'Carrier or thrust damage'],
    symptoms: ['Gear noise', 'Ratio errors', 'Metal debris and loss of drive in severe failures'],
    checks: ['Inspect gear teeth and pinion movement', 'Check thrust surfaces and bearings', 'Inspect for metal contamination throughout the unit'],
  },
  {
    name: 'VALVE BODY',
    short: 'Hydraulic routing center that meters line pressure to each apply circuit.',
    role: 'The valve body takes regulated line pressure and routes it through clutch regulator, select and converter circuits. Bore wear or a sticking valve can create very specific shift and engagement complaints.',
    failures: ['Clutch regulator valve sticking or bore wear', 'Pressure-regulator wear', 'Checkball erosion or separator-plate damage'],
    symptoms: ['Flares, harsh shifts or bind-ups', 'No Forward or no Reverse with normal line pressure', 'Burned clutches from poor apply control'],
    checks: ['Vacuum-test suspect valve bores', 'Inspect checkballs and separator plate', 'Verify clutch regulator valve movement and calibration'],
  },
  {
    name: 'TEHCM / SOLENOID BODY',
    short: 'Electronic-hydraulic control module that commands shift, pressure and converter operation.',
    role: 'The TEHCM integrates the transmission control electronics with the solenoid body. It commands pressure-control and shift solenoids, monitors speed signals and coordinates converter-clutch operation.',
    failures: ['Solenoid performance faults', 'Pressure-switch or internal circuit faults', 'Electrical or communication problems'],
    symptoms: ['Harsh shifts or failsafe operation', 'Solenoid or pressure-control DTCs', 'Converter clutch or shift timing complaints'],
    checks: ['Scan commanded vs. actual data', 'Perform circuit and solenoid tests', 'Confirm power, ground, communication and speed-sensor inputs'],
  },
]

function FrictionStack({ count = 6, radius = 1.05, x = 0 }: { count?: number, radius?: number, x?: number }) {
  return (
    <group position={[x, 0, 0]}>
      {Array.from({ length: count }).map((_, i) => (
        <mesh key={i} position={[(i - (count - 1) / 2) * 0.09, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[radius, 0.045, 10, 56]} />
          <meshStandardMaterial color={i % 2 ? '#aeb4b8' : '#2c2f31'} metalness={0.9} roughness={0.26} />
        </mesh>
      ))}
    </group>
  )
}

function Planetary({ x = 0, scale = 1 }: { x?: number, scale?: number }) {
  return (
    <group position={[x, 0, 0]} scale={scale}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.98, 0.11, 16, 60]} />
        <meshStandardMaterial color="#8b9398" metalness={1} roughness={0.23} />
      </mesh>
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2
        return (
          <mesh key={i} position={[0, Math.cos(a) * 0.62, Math.sin(a) * 0.62]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.2, 0.2, 0.28, 24]} />
            <meshStandardMaterial color="#34383b" metalness={1} roughness={0.25} />
          </mesh>
        )
      })}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.26, 0.26, 0.7, 28]} />
        <meshStandardMaterial color="#151719" metalness={0.95} roughness={0.2} />
      </mesh>
    </group>
  )
}

function Exploded6L80({ exploded, activePart }: { exploded: boolean, activePart: number }) {
  const group = useRef<THREE.Group>(null)
  const progress = useRef(0)

  useFrame((_, delta) => {
    progress.current = THREE.MathUtils.damp(progress.current, exploded ? 1 : 0.08, 3.1, delta)
    if (group.current) group.current.rotation.y += delta * 0.035
  })

  const px = (base: number, spread: number, index: number) => base + spread * progress.current + (activePart === index ? 0.45 : 0)
  const selected = (index: number) => activePart === index ? '#d71920' : '#727a80'

  return (
    <group ref={group} rotation={[0.08, -0.28, -0.14]} scale={0.84}>
      <group position={[px(-3.15, -1.4, 0), 0, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[1.55, 1.22, 0.42, 56]} />
          <meshStandardMaterial color={selected(0)} metalness={0.98} roughness={0.23} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[1.05, 0.11, 16, 56]} />
          <meshStandardMaterial color="#191b1e" metalness={0.95} roughness={0.2} />
        </mesh>
      </group>

      <group position={[px(-1.95, -0.95, 1), 0, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[1.35, 1.35, 0.82, 56]} />
          <meshStandardMaterial color={selected(1)} metalness={0.94} roughness={0.28} />
        </mesh>
        <FrictionStack count={7} radius={1.05} />
      </group>

      <group position={[px(-0.65, -0.4, 2), 0, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[1.26, 1.26, 0.72, 56]} />
          <meshStandardMaterial color={selected(2)} metalness={0.95} roughness={0.24} />
        </mesh>
        <FrictionStack count={6} radius={0.98} />
      </group>

      <group position={[px(0.58, 0.28, 3), 0, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[1.48, 1.28, 0.64, 56]} />
          <meshStandardMaterial color={selected(3)} metalness={0.96} roughness={0.24} />
        </mesh>
        <FrictionStack count={5} radius={1.05} />
      </group>

      <group position={[px(1.62, 0.85, 4), 0, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[1.46, 1.46, 0.52, 56]} />
          <meshStandardMaterial color={selected(4)} metalness={0.93} roughness={0.3} />
        </mesh>
        <FrictionStack count={5} radius={1.08} />
      </group>

      <group position={[px(2.48, 1.2, 5), 0, 0]}>
        <FrictionStack count={5} radius={1.0} />
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[1.15, 0.12, 16, 56]} />
          <meshStandardMaterial color={selected(5)} metalness={0.92} roughness={0.29} />
        </mesh>
      </group>

      <group position={[px(3.55, 1.65, 6), 0, 0]}>
        <Planetary scale={1.02} />
        <mesh position={[0.46, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.34, 0.34, 1.2, 30]} />
          <meshStandardMaterial color={selected(6)} metalness={0.95} roughness={0.22} />
        </mesh>
      </group>

      <group position={[0, -2.05 - progress.current * 1.05, 0.1]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <boxGeometry args={[4.15, 1.7, 0.22]} />
          <meshStandardMaterial color={activePart === 6 ? '#303438' : '#0f1113'} metalness={0.78} roughness={0.33} />
        </mesh>
        {[-1.5, -1, -0.5, 0, 0.5, 1, 1.5].map((p) => (
          <mesh key={p} position={[p, 0.25, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.45, 20]} />
            <meshStandardMaterial color={activePart === 7 ? '#d71920' : '#35393c'} metalness={0.86} roughness={0.28} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

export default function Home() {
  const [exploded, setExploded] = useState(true)
  const [activePart, setActivePart] = useState(0)
  const active = useMemo(() => PARTS[activePart], [activePart])

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
          <p className="sub">Transmission rebuilding, diagnostics and complete auto repair for all makes and models.</p>
          <div className="actions"><a href="#services" className="primary">OUR SERVICES</a><a href="#lab" className="secondary">OPEN 6L80 LAB →</a></div>
        </motion.div>
        <div className="heroBadge"><span>844</span><b>SHUGART RD.</b><small>DALTON, GA</small></div>
      </section>

      <section className="stats">
        <div><b>TRANSMISSIONS</b><span>DIAGNOSIS & REBUILDING</span></div>
        <div><b>ALL MAKES</b><span>& MODELS</span></div>
        <div><b>IN-HOUSE</b><span>REBUILD WORK</span></div>
        <div><b>DALTON</b><span>GEORGIA</span></div>
      </section>

      <section id="lab" className="lab labV2">
        <div className="labHeading">
          <p className="eyebrow">INTERACTIVE TRANSMISSION LAB / 001</p>
          <h2>EXPLORE THE <i>6L80</i></h2>
          <p className="lead">Built from teardown order and technical references. This viewer follows the real 6L80 assembly sequence more closely: pump, rotating clutch drums, center-support clutch section, rear geartrain and hydraulic controls.</p>
          <button className="explodeButton" onClick={() => setExploded((v) => !v)}>{exploded ? 'ASSEMBLE 6L80' : 'EXPLODE 6L80'}</button>
        </div>

        <div className="labStage">
          <Canvas camera={{ position: [0, 2.7, 11], fov: 41 }}>
            <ambientLight intensity={0.75} />
            <directionalLight position={[5, 7, 5]} intensity={4.6} />
            <pointLight position={[-5, 1, 4]} intensity={4.2} color="#d2232a" />
            <pointLight position={[5, -2, 2]} intensity={2.4} color="#8e979d" />
            <Exploded6L80 exploded={exploded} activePart={activePart} />
            <Environment preset="warehouse" />
            <OrbitControls enablePan={false} minDistance={7} maxDistance={14} autoRotate={false} />
          </Canvas>
          <div className="labHud"><span>DRAG TO ROTATE</span><span>SCROLL TO ZOOM</span><strong>{exploded ? 'EXPLODED VIEW' : 'ASSEMBLED VIEW'}</strong></div>
        </div>

        <div className="componentPanel">
          {PARTS.map((part, index) => (
            <button key={part.name} className={activePart === index ? 'active' : ''} onClick={() => setActivePart(index)}>
              <span>{String(index + 1).padStart(2, '0')}</span><b>{part.name}</b><i>VIEW</i>
            </button>
          ))}
        </div>

        <div className="partDetail">
          <span>SELECTED COMPONENT</span>
          <h3>{active.name}</h3>
          <p>{active.short}</p>
          <div className="researchGrid">
            <div><b>WHAT IT DOES</b><p>{active.role}</p></div>
            <div><b>COMMON FAILURES</b><ul>{active.failures.map((x) => <li key={x}>{x}</li>)}</ul></div>
            <div><b>WHAT THE DRIVER MAY NOTICE</b><ul>{active.symptoms.map((x) => <li key={x}>{x}</li>)}</ul></div>
            <div><b>WHAT A TECH CHECKS</b><ul>{active.checks.map((x) => <li key={x}>{x}</li>)}</ul></div>
          </div>
        </div>
      </section>

      <section id="services" className="services">
        <div><p className="eyebrow">WHAT WE DO</p><h2>TRANSMISSION<br /><i>SPECIALISTS.</i></h2><p className="lead">From diagnosis to complete rebuilding, customers can see what failed and understand what is being repaired.</p></div>
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
