import type { NextPage } from 'next'
import styles from "../../../styles/Home.module.css";
import Head from "next/head";
import {Navbar} from "../../components/Navbar";

const Essays: NextPage = () => {
    return (
    <div className={styles.container}>
      <Head>
        <title>Home - Rakeeb Hossain</title>
      </Head>

      <main className={styles.main}>
        <p className={styles.subtitle}>
          Essays
        </p>
        <div className={styles.description}>
            Under construction.
        </div>
      </main>
      <Navbar/>
    </div>
  )
}

export default Essays;