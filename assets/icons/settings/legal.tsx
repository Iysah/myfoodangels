import * as React from "react"
import Svg, { Path } from "react-native-svg"

const LegalIcon = (props: any) => {
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
        d="M10 11.628l-4.925 5.794a1.743 1.743 0 01-2.564.103 1.752 1.752 0 01.103-2.57l5.781-4.935"
        stroke="#141B34"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <Path
        d="M18 10.067l-4.952 4.963M9.952 2.002L5 6.965m4.333-4.343L5.62 6.345s1.857 2.481 3.714 4.343c1.857 1.86 4.334 3.722 4.334 3.722l3.714-3.722s-1.857-2.482-3.714-4.343C11.81 4.484 9.333 2.622 9.333 2.622zM20 11.66l2-1.64m-2 4.92l2 1.093M11.002 21.999H21m-8.773 0c.551-.988.963-2.877 2.915-2.983.58-.032 1.17-.032 1.75 0 1.951.106 2.365 1.995 2.917 2.983"
        stroke="#141B34"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export default LegalIcon