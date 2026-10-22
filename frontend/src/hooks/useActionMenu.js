import { useEffect, useRef, useState } from "react";
export default function useActionMenu() {
  const [openMenu, setOpenMenu] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const menuRef = useRef(null);
  const toggleMenu = (id, event) => {
    if (openMenu === id) {
      setOpenMenu(null);
      setMenuAnchor(null);
    } else {
      setMenuAnchor(event?.currentTarget || null);
      setOpenMenu(id);
    }
  };
  useEffect(() => {
    if (openMenu === null) return;
    const outside = e => {
      if (!menuRef.current?.contains(e.target) &&
          !menuAnchor?.contains(e.target)) setOpenMenu(null);
    };
    const close = () => setOpenMenu(null);
    document.addEventListener("pointerdown", outside);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("pointerdown", outside);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [openMenu, menuAnchor]);
  return {openMenu, toggleMenu, menuRef, setOpenMenu, menuAnchor};
}
