import React, { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import { IconType } from "react-icons";
import { MdLightMode, MdDarkMode } from "react-icons/md";
import { motion, useAnimation } from "framer-motion";

const FiSun = MdLightMode as unknown as React.FC<{ size?: number; color?: string }>;
const FiMoon = MdDarkMode as unknown as React.FC<{ size?: number; color?: string }>;

const buttons = [
  "AC", "±", "%", "÷",
  "7", "8", "9", "×",
  "4", "5", "6", "-",
  "1", "2", "3", "+",
  "0", ".", "=",
];

function AppleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <label className="apple-switch" title={checked ? "Light Mode On" : "Light Mode Off"}>
      <input type="checkbox" checked={checked} onChange={onChange} />
      <motion.div
        style={{
          position: 'absolute',
          top: '2px',
          left: '2px',
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          backgroundColor: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 6px rgba(255, 255, 255, 0.6)',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
        animate={{ x: checked ? 26 : 0 }}
        transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
      >
        {checked ? (<FiSun size={20} color="black" />) : (<FiMoon size={20} color="white" />)}
      </motion.div>
      <style>{`
         .apple-switch {
           position: relative;
           display: inline-block;
           width: 60px;
           height: 32px;
           border-radius: 16px; /* Make the outer box rounded */
           background-color: #333;
           border: 2px solid white;
           cursor: pointer;
           user-select: none;
         }
         .apple-switch input {
           opacity: 0;
           width: 0;
         }
        .slider-track {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 16px; /* Updated to make it round */
          background-color: transparent;
          border: 2px solid white;
          box-sizing: border-box;
         }
      `}</style>
    </label>
  );
}

export default function App() {
  const [lightMode, setLightMode] = useState(false);
  const [display, setDisplay] = useState("0");
  const controls = useAnimation();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { key } = event;
      if ((key >= "0" && key <= "9") || key === ".") {
        event.preventDefault();
        if (key === ".") {
          inputDot();
        } else {
          inputDigit(key);
        }
      } else if (key === "+" || key === "-" || key === "*" || key === "/") {
        event.preventDefault();
        const op = key === "*" ? "×" : key === "/" ? "÷" : key;
        inputOperator(op);
      } else if (key === "Enter" || key === "=") {
        event.preventDefault();
        calculateResult();
      } else if (key === "Backspace") {
        event.preventDefault();
        backspace();
      } else if (key.toLowerCase() === "c") {
        event.preventDefault();
        clear();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [display]);

  useEffect(() => {
    controls.start({
      x: [20, 0],
      transition: { type: "spring", stiffness: 300, damping: 30 },
    });
  }, [display, controls]);

  const inputDigit = (digit: string) => {
    setDisplay((prev) => (prev === "0" ? digit : prev + digit));
  };

  const inputDot = () => {
    if (!display.includes(".")) {
      setDisplay((prev) => prev + ".");
    }
  };

  const inputOperator = (op: string) => {
    const lastChar = display[display.length - 1];
    if (["+", "-", "×", "÷"].includes(lastChar)) {
      setDisplay((prev) => prev.slice(0, -1) + op);
    } else {
      setDisplay((prev) => prev + op);
    }
  };

  const calculateResult = () => {
    try {
      // Replace × and ÷ with * and / for eval
      const expression = display.replace(/×/g, "*").replace(/÷/g, "/");
      // eslint-disable-next-line no-eval
      const result = eval(expression);
      setDisplay(String(result));
    } catch {
      setDisplay("Error");
    }
  };

  const backspace = () => {
    setDisplay((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"));
  };

  const clear = () => {
    setDisplay("0");
  };

  const toggleSign = () => {
    if (display.startsWith("-")) {
      setDisplay(display.slice(1));
    } else {
      setDisplay("-" + display);
    }
  };

  const inputPercent = () => {
    try {
      const value = parseFloat(display);
      if (value === 0) return;
      setDisplay(String(value / 100));
    } catch {
      setDisplay("Error");
    }
  };

  const handleButtonClick = (button: string) => {
    switch (button) {
      case "AC":
        clear();
        break;
      case "±":
        toggleSign();
        break;
      case "%":
        inputPercent();
        break;
      case ".":
        inputDot();
        break;
      case "+":
      case "-":
      case "×":
      case "÷":
        inputOperator(button);
        break;
      case "=":
        calculateResult();
        break;
      default:
        inputDigit(button);
        break;
    }
  };

  return (
    <div
      className={clsx("app", {
        light: lightMode,
      })}
    >
      <div className="top-right-controls">
        <AppleSwitch
          checked={lightMode}
          onChange={() => setLightMode(!lightMode)}
        />
      </div>
      <div className="calculator">
        <div className="display">
          <motion.div
            animate={controls}
            initial={{ x: 0 }}
          >
            {display}
          </motion.div>
        </div>
        <div className="buttons">
          {buttons.map((btn, i) => (
            <button
              key={i}
              className={clsx("button", {
                operator: ["+", "-", "×", "÷", "="].includes(btn),
                zero: btn === "0",
              })}
              onClick={() => handleButtonClick(btn)}
            >
              {btn}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}