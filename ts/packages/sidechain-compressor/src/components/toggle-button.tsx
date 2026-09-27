import classNames from "classnames";
import { ReactNode, useEffect, useState } from "react";
import { join } from "../utils/string";
import { FunctionAny } from "../utils/types";
import styles from "./toggle-button.module.css";

const CheckedIcon = () => <>🌜</>;
const UncheckedIcon = () => <>🌞</>;

const ToggleButton = (props: {
  defaultChecked?: boolean;
  onChange?: FunctionAny;
  disabled?: boolean;
  className?: string;
  icons?: {
    checked: ReactNode;
    unchecked: ReactNode;
  };
}) => {
  props = { ...ToggleButton.defaultProps, ...props };
  const [toggle, setToggle] = useState(false);
  const { defaultChecked, onChange, disabled, className } = props;

  useEffect(() => {
    if (defaultChecked) {
      setToggle(defaultChecked);
    }
  }, [defaultChecked]);

  const triggerToggle = () => {
    if (disabled) {
      return;
    }

    setToggle(!toggle);

    if (typeof onChange === "function") {
      onChange(!toggle);
    }
  };

  // 'checked': toggle,
  // 'disabled': disabled,
  const toggleClasses = classNames(
    styles["wrg-toggle"],
    {
      [styles["wrg-toggle--checked"]]: toggle,
      [styles["wrg-toggle--disabled"]]: disabled,
    },
    className,
  );

  const cx = "17.4";
  const cy = "17.4";

  return (
    <div onClick={triggerToggle} className={toggleClasses}>
      <div className={styles["wrg-toggle-container"]}>
        <div className={styles["wrg-toggle-circle"]}>
          <svg
            className={join(
              styles.svg,
              styles["wrg-toggle"],
              styles.knob,
              styles.outline,
            )}
            x="0px"
            y="0px"
            width="68px"
            height="68px"
          >
            <defs>
              <linearGradient id="gradient" y1="0" y2="1">
                <stop stopColor="rgba(255,255,255,0.25)" offset="0" />
                <stop stopColor="rgba(0,0,0,1)" offset="1" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <input
          className={styles["wrg-toggle-input"]}
          type="checkbox"
          aria-label="Toggle Button"
        />
      </div>
    </div>
  );
};

ToggleButton.defaultProps = {
  icons: {
    checked: <CheckedIcon />,
    unchecked: <UncheckedIcon />,
  },
};

export { ToggleButton };
