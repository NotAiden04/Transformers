'use client'

import Image from 'next/image'
import { useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Canvas, ThreeEvent, useFrame } from '@react-three/fiber'
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
    short: 'Front hydraulic pump and stator support assembly.',
    role: 'Creates line pressure and routes apply oil into the rotating clutch circuits while supporting converter oil flow.',
    failures: ['Pump wear or pressure loss', 'Stator-support gasket or sealing leakage', 'Damaged sealing rings or bushings'],
    symptoms: ['Delayed engagement', 'Low or erratic line pressure', 'Multiple clutch slip or converter concerns'],
    checks: ['Verify commanded vs actual line pressure', 'Air-check clutch feeds', 'Inspect pump faces, stator support and sealing areas'],
  },
  {
    name: '3-5-R / 1-2-3-4 DRUM',
    short: 'Large front rotating drum containing two major clutch systems.',
    role: 'Carries the 3-5-Reverse and 1-2-3-4 clutch elements. Damage or leakage here can affect several forward ranges and Reverse.',
    failures: ['Drum weld or snap-ring issues', 'Piston/seal leakage', 'Burned frictions and steels'],
    symptoms: ['No or slipping Reverse', 'Shift flare', 'Wrong-gear starts or burned clutch material'],
    checks: ['Air-check both circuits', 'Inspect welds and retention', 'Inspect pistons, seals, frictions and steels'],
  },
  {
    name: '4-5-6 CLUTCH ASSEMBLY',
    short: 'Upper-range rotating clutch drum and friction pack.',
    role: 'Applies through the upper forward ranges. Clearance and feed sealing are critical to clean 4th, 5th and 6th gear operation.',
    failures: ['Burned 4-5-6 frictions', 'Incorrect clutch clearance', 'Compensator-feed or sealing-ring leakage'],
    symptoms: ['Slip or flare in upper gears', 'Bind after rebuild', 'Overheated 4-5-6 clutch pack'],
    checks: ['Measure clutch clearance', 'Air-check apply circuit', 'Inspect turbine-shaft seals, piston and backing hardware'],
  },
  {
    name: 'CENTER SUPPORT / 2-6 CLUTCH',
    short: 'Stationary center support with the 2-6 clutch section.',
    role: 'Supports the middle of the geartrain and carries stationary clutch elements that react torque into the case.',
    failures: ['Support seal leakage', 'Burned 2-6 frictions', 'Piston or apply-circuit leakage'],
    symptoms: ['2nd or 6th gear slip', '1-2 or 5-6 flare', 'Ratio codes or poor shift quality'],
    checks: ['Air-check 2-6 apply', 'Inspect support seals and bores', 'Inspect frictions, steels and piston seals'],
  },
  {
    name: 'LOW / REVERSE CLUTCH',
    short: 'Rear stationary holding clutch used in Reverse and low-range operation.',
    role: 'Anchors part of the geartrain during Reverse and selected low-speed conditions and must release correctly during transitions.',
    failures: ['Apply leakage', 'Burned clutch material', 'Hydraulic feed or checkball issues'],
    symptoms: ['Weak or delayed Reverse contribution', 'Engine-braking complaints', 'Bind or harsh low-range engagement'],
    checks: ['Air-check Low/Reverse circuit', 'Inspect friction pack and seals', 'Verify related hydraulic feed paths'],
  },
  {
    name: 'REAR PLANETARY / OUTPUT CARRIER',
    short: 'Rear planetary gearset and output carrier.',
    role: 'Combines ring, sun and planet members to create ratio changes and transmit torque to the output shaft.',
    failures: ['Pinion or needle-bearing wear', 'Gear tooth damage', 'Lubrication or thrust failure'],
    symptoms: ['Geartrain noise', 'Ratio errors', 'Metal debris or loss of drive'],
    checks: ['Inspect pinions and gear teeth', 'Check thrust surfaces and bearings', 'Inspect lubrication passages and debris'],
  },
  {
    name: 'VALVE BODY',
    short: 'Cast-aluminum hydraulic control body mounted above the pan.',
    role: 'Meters and routes regulated pressure through clutch, converter and select circuits according to commanded operation.',
    failures: ['Regulator bore wear', 'Sticking valves', 'Checkball or separator-plate wear'],
    symptoms: ['Flares, harsh shifts or bind', 'No Forward or Reverse with pressure present', 'Burned clutches from poor apply control'],
    checks: ['Vacuum-test suspect bores', 'Inspect plate and checkballs', 'Verify valve movement and hydraulic integrity'],
  },
  {
    name: 'TEHCM / SOLENOID BODY',
    short: 'Integrated transmission controller and solenoid body.',
    role: 'Combines the transmission control electronics with pressure-control and shift solenoids and monitors transmission inputs.',
    failures: ['Solenoid performance faults', 'Pressure-switch/internal circuit faults', 'Electrical or communication problems'],
    symptoms: ['Harsh shifting or failsafe', 'Solenoid/pressure-control codes', 'TCC or shift timing complaints'],
    checks: ['Review scan data', 'Perform circuit/solenoid tests', 'Confirm power, ground, communication and speed inputs'],
  },
]

const CASE_GREY = '#777d80'
const DARK = '#181b1d'
const STEEL = '#b3b7b9'
const FRICTION = '#2a2927'
const RED = '#d71920'

function mat(color: string, active = false, metalness = 0.9, roughness = 0.32) {
  return <meshStandardMaterial color={active ? RED : color} metalness={metalness} roughness={roughness} />
}

function FrictionPack({ count, radius, width = 0.52 }: { count: number; radius: number; width?: number }) {
  return (
    <group>
      {Array.from({ length: count }).map((_, i) => (
        <mesh key={i} position={[(i - (count - 1) / 2) * (width / count), 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[radius, 0.055, 12, 54]} />
          {mat(i % 2 ? STEEL : FRICTION, false, i % 2 ? 0.98 : 0.3, i % 2 ? 0.2 : 0.68)}
        </mesh>
      ))}
    </group>
  )
}

function SplinedHub({ radius = 0.63, length = 0.7 }: { radius?: number; length?: number }) {
  return (
    <group>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[radius, radius, length, 42]} />
        {mat('#52585c')}
      </mesh>
      {Array.from({ length: 16 }).map((_, i) => {
        const a = (i / 16) * Math.PI * 2
        return (
          <mesh key={i} position={[0, Math.cos(a) * radius * 0.93, Math.sin(a) * radius * 0.93]} rotation={[0, 0, Math.PI / 2]}>
            <boxGeometry args={[length * 0.96, 0.055, 0.07]} />
            {mat('#202326')}
          </mesh>
        )
      })}
    </group>
  )
}

function PlanetarySet({ active }: { active: boolean }) {
  return (
    <group>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.98, 0.14, 18, 64]} />
        {mat('#8c9498', active)}
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2
        return (
          <group key={i} position={[0, Math.cos(a) * 0.62, Math.sin(a) * 0.62]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.21, 0.21, 0.34, 22]} />
              {mat('#3c4246', active)}
            </mesh>
            {Array.from({ length: 10 }).map((_, t) => {
              const ta = (t / 10) * Math.PI * 2
              return (
                <mesh key={t} position={[0, Math.cos(ta) * 0.205, Math.sin(ta) * 0.205]}>
                  <boxGeometry args={[0.34, 0.035, 0.045]} />
                  {mat('#111315')}
                </mesh>
              )
            })}
          </group>
        )
      })}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.3, 0.3, 0.88, 32]} />
        {mat('#202427', active)}
      </mesh>
    </group>
  )
}

function CaseShell({ opacity = 1 }: { opacity?: number }) {
  const points = useMemo(
    () => [
      new THREE.Vector2(0.0, 2.15),
      new THREE.Vector2(0.28, 2.12),
      new THREE.Vector2(0.62, 1.92),
      new THREE.Vector2(1.02, 1.55),
      new THREE.Vector2(1.44, 1.32),
      new THREE.Vector2(3.7, 1.27),
      new THREE.Vector2(4.35, 1.08),
      new THREE.Vector2(4.95, 0.82),
      new THREE.Vector2(5.55, 0.72),
    ],
    []
  )
  return (
    <group position={[-2.85, 0.2, 0]}>
      <mesh rotation={[0, 0, -Math.PI / 2]}>
        <latheGeometry args={[points, 72]} />
        <meshStandardMaterial color={CASE_GREY} metalness={0.72} roughness={0.54} transparent opacity={opacity} side={THREE.DoubleSide} />
      </mesh>
      {[0.65, 1.02, 1.43].map((x) => (
        <mesh key={x} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[1.6 - x * 0.26, 0.055, 10, 64]} />
          <meshStandardMaterial color="#555b5e" metalness={0.7} roughness={0.5} transparent opacity={opacity} />
        </mesh>
      ))}
      <mesh position={[2.05, -1.38, 0]}>
        <boxGeometry args={[2.95, 0.28, 2.0]} />
        <meshStandardMaterial color="#2a2d2f" metalness={0.62} roughness={0.48} transparent opacity={opacity} />
      </mesh>
      <mesh position={[5.36, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.74, 0.64, 0.9, 44]} />
        <meshStandardMaterial color="#656b6e" metalness={0.78} roughness={0.46} transparent opacity={opacity} />
      </mesh>
      {Array.from({ length: 10 }).map((_, i) => {
        const a = (i / 10) * Math.PI * 2
        return (
          <mesh key={i} position={[0.08, Math.cos(a) * 1.83, Math.sin(a) * 1.83]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.07, 0.07, 0.16, 14]} />
            <meshStandardMaterial color="#3d4143" metalness={0.7} roughness={0.52} transparent opacity={opacity} />
          </mesh>
        )
      })}
    </group>
  )
}

function ValveBody({ active, tehcmActive }: { active: boolean; tehcmActive: boolean }) {
  return (
    <group>
      <mesh>
        <boxGeometry args={[3.8, 0.32, 1.72]} />
        {mat('#6e7477', active, 0.78, 0.42)}
      </mesh>
      {[-1.55, -1.05, -0.55, -0.05, 0.45, 0.95, 1.45].map((x, i) => (
        <mesh key={x} position={[x, 0.26, i % 2 ? 0.38 : -0.3]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.105, 0.105, 0.5, 18]} />
          {mat('#2d3235', tehcmActive)}
        </mesh>
      ))}
      <mesh position={[0.15, -0.22, 0.82]}>
        <boxGeometry args={[2.75, 0.22, 0.52]} />
        {mat('#101214', tehcmActive, 0.25, 0.66)}
      </mesh>
      <mesh position={[1.55, -0.12, 0.94]}>
        <cylinderGeometry args={[0.26, 0.26, 0.55, 24]} />
        {mat('#171a1c', tehcmActive)}
      </mesh>
    </group>
  )
}

function Rebuilt6L80({ exploded, activePart, setActivePart }: { exploded: boolean; activePart: number; setActivePart: (n: number) => void }) {
  const root = useRef<THREE.Group>(null)
  const refs = useRef<(THREE.Group | null)[]>([])
  const progress = useRef(exploded ? 1 : 0)
  const base = [-2.28, -1.35, -0.35, 0.72, 1.55, 2.55]
  const spread = [-2.4, -1.55, -0.72, 0.5, 1.35, 2.25]

  useFrame((_, delta) => {
    progress.current = THREE.MathUtils.damp(progress.current, exploded ? 1 : 0, 4.2, delta)
    refs.current.forEach((g, i) => {
      if (!g) return
      const targetX = base[i] + spread[i] * progress.current + (activePart === i ? 0.32 : 0)
      g.position.x = THREE.MathUtils.damp(g.position.x, targetX, 6, delta)
    })
    if (root.current) root.current.rotation.y += delta * 0.02
  })

  const click = (index: number) => (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    setActivePart(index)
  }

  return (
    <group ref={root} rotation={[0.05, -0.32, -0.12]} scale={0.88}>
      <CaseShell opacity={exploded ? 0.11 : 0.92} />

      <group ref={(el) => { refs.current[0] = el }} position={[base[0], 0.15, 0]} onClick={click(0)}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[1.48, 1.25, 0.38, 64]} />
          {mat('#858b8e', activePart === 0)}
        </mesh>
        <mesh position={[-0.17, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.48, 0.48, 0.82, 42]} />
          {mat(DARK, activePart === 0)}
        </mesh>
        <mesh position={[-0.35, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.92, 0.1, 18, 58]} />
          {mat('#3c4144', activePart === 0)}
        </mesh>
      </group>

      <group ref={(el) => { refs.current[1] = el }} position={[base[1], 0.05, 0]} onClick={click(1)}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[1.29, 1.29, 1.0, 64]} />
          {mat('#6f7578', activePart === 1)}
        </mesh>
        <mesh position={[-0.44, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[1.05, 0.08, 16, 60]} />
          {mat('#24282a', activePart === 1)}
        </mesh>
        <FrictionPack count={8} radius={0.98} width={0.54} />
        <SplinedHub radius={0.62} length={1.12} />
      </group>

      <group ref={(el) => { refs.current[2] = el }} position={[base[2], 0, 0]} onClick={click(2)}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[1.18, 1.18, 0.84, 60]} />
          {mat('#565d61', activePart === 2)}
        </mesh>
        <FrictionPack count={7} radius={0.9} width={0.48} />
        <mesh position={[0.42, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.99, 0.095, 16, 56]} />
          {mat('#2d3134', activePart === 2)}
        </mesh>
      </group>

      <group ref={(el) => { refs.current[3] = el }} position={[base[3], 0, 0]} onClick={click(3)}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[1.34, 1.24, 0.62, 60]} />
          {mat('#787f83', activePart === 3)}
        </mesh>
        <FrictionPack count={6} radius={1.0} width={0.44} />
        <mesh position={[0.32, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[1.1, 0.08, 16, 56]} />
          {mat(DARK, activePart === 3)}
        </mesh>
      </group>

      <group ref={(el) => { refs.current[4] = el }} position={[base[4], 0, 0]} onClick={click(4)}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[1.35, 1.35, 0.45, 58]} />
          {mat('#5d6367', activePart === 4)}
        </mesh>
        <FrictionPack count={5} radius={1.02} width={0.35} />
        <mesh position={[0.25, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[1.16, 0.1, 16, 56]} />
          {mat('#24282b', activePart === 4)}
        </mesh>
      </group>

      <group ref={(el) => { refs.current[5] = el }} position={[base[5], 0, 0]} onClick={click(5)}>
        <PlanetarySet active={activePart === 5} />
        <mesh position={[0.72, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.31, 0.31, 1.5, 34]} />
          {mat('#25292c', activePart === 5)}
        </mesh>
      </group>

      <group position={[0.05, -2.25 - progress.current * 1.15, 0]} onClick={click(6)}>
        <ValveBody active={activePart === 6} tehcmActive={activePart === 7} />
      </group>
    </group>
  )
}

export default function Home() {
  const [exploded, setExploded] = useState(false)
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
        <Image className="heroPhoto" src="/shop-front-ai.webp" alt="Trans-Formers Transmission shop exterior" fill priority sizes="100vw" />
        <div className="heroShade" />
        <motion.div className="photoHeroCopy" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75 }}>
          <p className="eyebrow">DALTON, GEORGIA • FAMILY OWNED</p>
          <h1>BUILT.<br /><i>REBUILT.</i><br />BACK ON THE ROAD.</h1>
          <p className="sub">Transmission rebuilding, diagnostics and complete auto repair for all makes and models.</p>
          <div className="actions"><a href="#services" className="primary">OUR SERVICES</a><a href="#lab" className="secondary">OPEN 6L80 LAB →</a></div>
        </motion.div>
        <div className="heroBadge"><span>844</span><b>SHUGART RD</b><small>DALTON, GA 30720</small></div>
      </section>

      <section className="stats">
        <div><b>TRANSMISSIONS</b><span>REBUILD • REPAIR • DIAGNOSE</span></div>
        <div><b>ALL MAKES</b><span>DOMESTIC • IMPORT</span></div>
        <div><b>IN-HOUSE</b><span>DIAGNOSIS & REBUILDING</span></div>
        <div><b>DALTON</b><span>GEORGIA</span></div>
      </section>

      <section id="lab" className="lab labV2">
        <div className="labHeading">
          <p className="eyebrow">6L80 INTERACTIVE RECONSTRUCTION</p>
          <h2>SEE WHAT'S<br /><i>INSIDE.</i></h2>
          <p className="lead">An original 6L80 educational reconstruction built from teardown order, service-component relationships and real 6L80 proportions. It is not factory CAD, but the case shape, major assemblies and exploded order are now modeled to read like the actual transmission instead of generic rings floating in space.</p>
          <button className="explodeButton" onClick={() => setExploded(!exploded)}>{exploded ? 'ASSEMBLE TRANSMISSION' : 'EXPLODE TRANSMISSION'}</button>
        </div>

        <div className="labStage">
          <Canvas camera={{ position: [0.2, 3.1, 10.4], fov: 37 }} dpr={[1, 1.6]}>
            <ambientLight intensity={0.72} />
            <directionalLight position={[4, 7, 5]} intensity={2.3} />
            <directionalLight position={[-4, 2, -3]} intensity={1.3} />
            <Rebuilt6L80 exploded={exploded} activePart={activePart} setActivePart={setActivePart} />
            <Environment preset="warehouse" />
            <OrbitControls enablePan={false} minDistance={6.5} maxDistance={14} target={[0, -0.25, 0]} />
          </Canvas>
          <div className="labHud"><span>DRAG TO ROTATE</span><span>SCROLL / PINCH TO ZOOM</span><strong>{exploded ? 'EXPLODED VIEW' : 'ASSEMBLED VIEW'}</strong></div>
        </div>

        <div className="componentPanel">
          {PARTS.map((p, i) => (
            <button key={p.name} className={activePart === i ? 'active' : ''} onClick={() => setActivePart(i)}>
              <span>{String(i + 1).padStart(2, '0')}</span><b>{p.name}</b><i>VIEW</i>
            </button>
          ))}
        </div>

        <div className="partDetail">
          <span>SELECTED ASSEMBLY</span>
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
        <div><p className="eyebrow">WHAT WE DO</p><h2>TRANSMISSION<br /><i>SPECIALISTS.</i></h2><p className="lead">From diagnosis to complete rebuilds, the work stays focused on finding the actual cause instead of throwing parts at the vehicle and hoping the automotive gods feel charitable.</p></div>
        <div className="serviceList">
          <p><b>01</b> Transmission Diagnostics</p>
          <p><b>02</b> Transmission Rebuilding</p>
          <p><b>03</b> Valve Body & Solenoid Repair</p>
          <p><b>04</b> Torque Converter Service</p>
          <p><b>05</b> Complete Auto Repair</p>
        </div>
      </section>

      <footer id="contact">
        <h2>READY TO GET IT<br /><i>FIXED RIGHT?</i></h2>
        <p>844 Shugart Rd, Dalton, GA 30720 • (706) 529-2706</p>
        <div className="footerActions"><a href="tel:+17065292706">CALL THE SHOP</a><a href="https://maps.google.com/?q=844+Shugart+Rd+Dalton+GA+30720">GET DIRECTIONS</a></div>
      </footer>
    </main>
  )
}
