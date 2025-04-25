import React from "react"

type ToggleProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  id?: string
  disabled?: boolean
}

function Toggle(props: ToggleProps) {
  const { checked, onChange, label, id, disabled } = props
  const inputId = id || "toggle-" + Math.random().toString(36).slice(2)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!disabled) onChange(e.target.checked)
  }

  return (
    <label
      htmlFor={inputId}
      className={
        "relative block h-8 w-14 rounded-full bg-gray-300 transition-colors [-webkit-tap-highlight-color:_transparent] " +
        (checked ? "bg-green-500" : "bg-gray-300") +
        (disabled ? " cursor-not-allowed opacity-50" : " cursor-pointer")
      }
    >
      <input
        type="checkbox"
        id={inputId}
        className="peer sr-only"
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
      />
      <span
        className={
          "absolute inset-y-0 start-0 m-1 size-6 rounded-full bg-white transition-[inset-inline-start] peer-checked:start-6"
        }
      ></span>
      {label && <span className="ml-4 align-middle text-sm select-none">{label}</span>}
    </label>
  )
}

export default Toggle
