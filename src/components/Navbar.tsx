import React, {FunctionComponent} from "react";
import Link from "next/link";
const items = ['About', 'Essays', 'Engineering', 'Bookshelf', 'Travel']
import styles from '../../styles/Navbar.module.css'

export const Navbar = () => {
    return (<div className={styles.navbar}>
        {
            items.map(item => {
            return (<Link href={`/${item.toLowerCase()}/`}>
                <a style={{display: "block"}}>{item}</a>
            </Link>)
        })}
    </div>)
}