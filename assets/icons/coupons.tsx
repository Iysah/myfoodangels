import * as React from "react"
import Svg, { Path } from "react-native-svg"

function CouponIcon(props: any) {
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
        d="M3 4.5h18a.5.5 0 01.5.5v4a.5.5 0 01-.5.5 2.5 2.5 0 000 5 .5.5 0 01.5.5v4a.5.5 0 01-.5.5H3a.5.5 0 01-.5-.5v-4a.5.5 0 01.5-.5 2.5 2.5 0 000-5 .5.5 0 01-.5-.5V5a.5.5 0 01.5-.5zm7 6a.5.5 0 01.5.5v2a.5.5 0 01-1 0v-2a.5.5 0 01.5-.5zm10.5 4.987l-.374-.097A3.506 3.506 0 0117.5 12l.013-.29a3.504 3.504 0 012.613-3.1l.374-.097V5.5h-10V7a.5.5 0 01-1 0V5.5h-6v3.014l.375.096A3.505 3.505 0 016.5 12l-.013.29a3.505 3.505 0 01-2.613 3.1l-.374.097V18.5h6V17a.5.5 0 011 0v1.5h10v-3.013z"
        stroke="#1C274C"
      />
    </Svg>
  )
}

export default CouponIcon
