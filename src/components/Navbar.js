'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import styles from './Navbar.module.css';
import { useNetwork } from './NetworkContext';
import { usePathname } from 'next/navigation';

const Navbar = () => {
  const [navbarClass, setNavbarClass] = useState(styles.navbar);
  const [logoSrc, setLogoSrc] = useState('/logo_with_word.png');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { network, setNetwork } = useNetwork();
  const dropdownRef = useRef(null);
  const menuRef = useRef(null);
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  const isHomePage = pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 0) {
        setNavbarClass(`${styles.navbar} ${styles.scrolled}`);
      } else {
        setNavbarClass(styles.navbar);
      }
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth < 1000);
      if (window.innerWidth < 1000) {
        setLogoSrc('/logo_with_word2.png');
      } else {
        setLogoSrc('/logo_with_word.png');
      }
    };

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target) && !event.target.closest(`.${styles.menuButton}`)) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    document.addEventListener('mousedown', handleClickOutside);
    handleResize(); // Call once to set initial state

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = useCallback((e) => {
    e.stopPropagation();
    setIsMenuOpen(prevState => !prevState);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleNetworkChange = useCallback((selectedNetwork) => {
    setNetwork(selectedNetwork);
    setIsDropdownOpen(false);
  }, [setNetwork]);

  return (
    <nav className={navbarClass}>
      <div className={styles.navContainer}>
        <Link href="https://vhagar.finance/" className={styles.logoLink}>
          <Image src={logoSrc} alt="Vhagar Logo" width={128} height={77} />
        </Link>
        <div ref={menuRef} className={`${styles.navLinks} ${isMenuOpen ? styles.open : ''}`}>
          <Link href="/" className={styles.navLink} onClick={closeMenu}>HOME</Link>
          <Link href="/swap" className={styles.navLink} onClick={closeMenu}>SWAP</Link>
          <Link href="https://app.vhagar.finance/" className={styles.navLink} onClick={closeMenu}>STAKE-VGR</Link>
          <Link href="https://docs.vhagar.finance/" className={styles.navLink} onClick={closeMenu}>GREENPAPER</Link>
          {!isHomePage && isMobile && (
            <div className={styles.networkDropdown} ref={dropdownRef}>
              <button className={styles.networkButton} onClick={toggleDropdown}>
                {network === 'mainnet-beta' ? 'MAINNET' : 'DEVNET'}
                <span className={styles.dropdownArrow}>▼</span>
              </button>
              {isDropdownOpen && (
                <div className={styles.dropdownContent}>
                  <button onClick={() => handleNetworkChange('mainnet-beta')}>MAINNET</button>
                  <button onClick={() => handleNetworkChange('devnet')}>DEVNET</button>
                </div>
              )}
            </div>
          )}
        </div>
        <div className={styles.rightSection}>
          {!isHomePage && !isMobile && (
            <div className={styles.networkDropdown} ref={dropdownRef}>
              <button className={styles.networkButton} onClick={toggleDropdown}>
                {network === 'mainnet-beta' ? 'MAINNET' : 'DEVNET'}
                <span className={styles.dropdownArrow}>▼</span>
              </button>
              {isDropdownOpen && (
                <div className={styles.dropdownContent}>
                  <button onClick={() => handleNetworkChange('mainnet-beta')}>MAINNET</button>
                  <button onClick={() => handleNetworkChange('devnet')}>DEVNET</button>
                </div>
              )}
            </div>
          )}
          {!isHomePage && <WalletMultiButton className={styles.walletButton} />}
          <button 
            className={`${styles.menuButton} ${isMenuOpen ? styles.open : ''}`} 
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            <svg className={styles.menuIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="24px" height="24px">
              <path d="M0 0h24v24H0z" fill="none"/>
              <path className={styles.menuIconPath} d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;