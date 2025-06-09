import * as React from "react"
import Svg, { Path } from "react-native-svg"

const HelpIcon = (props: any) => {
  return (
    <Svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
        stroke="#141B34"
        strokeWidth={1.5}
      />
      <Path
        d="M10 9a2 2 0 113.683 1.08C13.085 11.01 12 11.896 12 13v.5"
        stroke="#141B34"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <Path
        d="M11.992 17h.009"
        stroke="#141B34"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export default HelpIcon
