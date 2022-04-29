import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../../styles/Home.module.css'
import {Navbar} from "../components/Navbar";

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Home - Rakeeb Hossain</title>
      </Head>

      <main className={styles.main}>
        <p className={styles.subtitle}>
          Rakeeb Hossain
        </p>
        <div className={styles.description}>
            I'm a junior at the University of Waterloo majoring in CS and pure math. I spend a lot of time thinking about
            engineering, startups, and a miscellany of other topics. I accrue some of my more well-formed thoughts
            on this site.
        </div>
      </main>
      <Navbar/>
    </div>
  )
}

export default Home;
