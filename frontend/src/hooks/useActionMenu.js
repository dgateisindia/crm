import { useState, useRef, useEffect } from "react";

export default function useActionMenu() {

    const [openMenu, setOpenMenu] = useState(null);

    const menuRef = useRef(null);

    useEffect(() => {

        function handleClickOutside(e) {

            if (
                menuRef.current &&
                !menuRef.current.contains(e.target)
            ) {

                setOpenMenu(null);

            }

        }

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () =>
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );

    }, []);

    const toggleMenu = (id) => {

        setOpenMenu((prev) =>
            prev === id ? null : id
        );

    };

    return {

        openMenu,

        toggleMenu,

        menuRef,

        setOpenMenu

    };

}