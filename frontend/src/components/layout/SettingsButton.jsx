import { motion } from "framer-motion";
import { Settings } from "lucide-react";
import { useSettingsContext } from "../../context/SettingsContext.jsx";

export default function SettingsButton() {
  const { setIsSettingsOpen, setTempAddonApis, addonApis } = useSettingsContext();

  return (
    <button
      type="button"
      className="icon-button"
      onClick={() => {
        setTempAddonApis([...addonApis]);
        setIsSettingsOpen(true);
      }}
      title="Settings"
      aria-label="Open settings"
    >
      <motion.span
        className="flex items-center justify-center"
        whileHover={{ rotate: 45 }}
        transition={{ duration: 0.2 }}
      >
        <Settings size={20} />
      </motion.span>
    </button>
  );
}
