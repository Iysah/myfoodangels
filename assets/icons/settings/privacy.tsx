import * as React from "react"
import Svg, { Path } from "react-native-svg"

const PrivacyIcon = (props: any) => {
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
        d="M21 11.183V8.28c0-1.64 0-2.46-.404-2.995-.404-.535-1.318-.794-3.145-1.314a24.574 24.574 0 01-3.229-1.173C13.023 2.266 12.424 2 12 2c-.424 0-1.023.266-2.222.798-.88.39-1.98.818-3.229 1.173-1.827.52-2.74.78-3.145 1.314C3 5.82 3 6.64 3 8.28v2.903c0 5.625 5.063 9 7.594 10.336.607.32.91.481 1.406.481.495 0 .799-.16 1.406-.48C15.937 20.182 21 16.807 21 11.182zM12 7v2"
        stroke="#141B34"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  )
}

export default PrivacyIcon;