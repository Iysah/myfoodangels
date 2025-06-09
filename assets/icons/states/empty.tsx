import * as React from "react"
import Svg, {
  G,
  Path,
  Defs,
  LinearGradient,
  Stop,
  ClipPath
} from "react-native-svg"

const EmptyIcon = (props: any) => {
  return (
    <Svg
      width={168}
      height={168}
      viewBox="0 0 168 168"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <G clipPath="url(#clip0_125_5456)">
        <Path
          d="M4.29 94.36A14.605 14.605 0 010 83.998C0 75.908 6.56 69.35 14.651 69.35h1.53V98.65h-1.53a14.61 14.61 0 01-10.36-4.29z"
          fill="url(#paint0_linear_125_5456)"
        />
        <Path
          d="M163.709 132.241A14.605 14.605 0 01168 142.6c0 8.091-6.56 14.651-14.651 14.651H14.651a14.61 14.61 0 01-10.36-4.29A14.611 14.611 0 010 142.6c0-8.091 6.56-14.651 14.651-14.651h6.346v1.885c0 2.861 1.676 5.181 3.744 5.181h82.698c1.947 0 3.55-2.058 3.728-4.687.084-.019.168-.041.254-.059l.306-.072.396-.099.267-.069a40.838 40.838 0 001.134-.325l.185-.055c.171-.054.343-.108.513-.165l.144-.047c.183-.06.366-.124.549-.19.036-.011.069-.023.103-.035.196-.07.393-.143.59-.218l.06-.022c.208-.081.418-.163.627-.247l.02-.008a32.198 32.198 0 005.131-2.645l14.957 14.957a2.756 2.756 0 003.899-.001l4.304-4.305a2.756 2.756 0 000-3.899l-4.875-4.875h13.618c4.045 0 7.708 1.64 10.36 4.292z"
          fill="url(#paint1_linear_125_5456)"
        />
        <Path
          d="M163.71 73.641A14.6 14.6 0 01168 84c0 8.094-6.56 14.65-14.651 14.65h-1.529V69.352h1.529c4.046 0 7.708 1.64 10.361 4.29z"
          fill="url(#paint2_linear_125_5456)"
        />
        <Path
          d="M4.29 35.758A14.597 14.597 0 010 25.4C0 17.31 6.56 10.75 14.651 10.75H153.35c4.045 0 7.708 1.64 10.36 4.29A14.611 14.611 0 01168 25.4c0 8.091-6.56 14.648-14.651 14.648h-2.27a5.252 5.252 0 00-4.516-2.565h-3.761v-2.337a5.257 5.257 0 00-5.255-5.257h-45.16a18.586 18.586 0 00-11.184-3.726c-4.192 0-7.997 1.327-11.196 3.726h-48.57a5.257 5.257 0 00-5.257 5.257v4.902h-1.529a14.61 14.61 0 01-10.36-4.29z"
          fill="url(#paint3_linear_125_5456)"
        />
        <Path
          d="M16.18 44.22v20.763h-.047c-5.734 0-10.381-4.649-10.381-10.383 0-5.733 4.647-10.38 10.38-10.38h.048z"
          fill="url(#paint4_linear_125_5456)"
        />
        <Path
          d="M153.515 54.6c0 2.1-.623 4.053-1.695 5.685V48.917a10.32 10.32 0 011.695 5.683z"
          fill="url(#paint5_linear_125_5456)"
        />
        <Path
          d="M111.167 130.329c-.178 2.629-1.779 4.687-3.727 4.687h-82.7c-2.067 0-3.744-2.32-3.744-5.181v-11.666c.145.012.292.018.44.018h3.76v2.337a5.257 5.257 0 005.257 5.257h55.709c7.48 4.926 16.546 6.441 25.003 4.548h.002z"
          fill="url(#paint6_linear_125_5456)"
        />
        <Path
          d="M21.436 29.89h49.287c-1.306.915-2.5 2.009-3.547 3.264a18.14 18.14 0 00-2.681 4.33H30.453a5.257 5.257 0 00-5.257 5.256v75.447h-3.76a5.26 5.26 0 01-5.257-5.257V35.146a5.257 5.257 0 015.257-5.256z"
          fill="url(#paint7_linear_125_5456)"
        />
        <Path
          d="M142.801 35.146v2.337h-44.89a18.347 18.347 0 00-6.242-7.593h45.877a5.256 5.256 0 015.255 5.256z"
          fill="url(#paint8_linear_125_5456)"
        />
        <Path
          d="M151.82 42.74v77.784a5.257 5.257 0 01-5.257 5.257h-24.669a32.78 32.78 0 008.092-7.577c.271-.356.536-.719.79-1.085l.054-.081c7.649-11.078 7.65-25.843 0-36.923a32.726 32.726 0 00-3.792-4.55c-12.709-12.705-33.311-12.705-46.02.002-12.708 12.71-12.708 33.311 0 46.019a32.551 32.551 0 005.145 4.195h-55.71a5.257 5.257 0 01-5.257-5.257V42.74a5.257 5.257 0 015.257-5.257h34.042a18.26 18.26 0 00-1.55 7.359c0 2.548.552 5.109 1.55 7.36 2.834 6.412 9.258 10.9 16.707 10.9 2.808 0 5.496-.618 7.99-1.838a18.299 18.299 0 008.726-9.062 18.222 18.222 0 001.544-7.36c0-2.554-.552-5.107-1.55-7.359h48.651a5.257 5.257 0 015.257 5.257z"
          fill="url(#paint9_linear_125_5456)"
        />
        <Path
          d="M146.563 37.483H97.912a18.11 18.11 0 011.55 7.359 18 18 0 01-1.544 7.36h53.902V42.74a5.257 5.257 0 00-5.257-5.257zm-116.11 0a5.257 5.257 0 00-5.257 5.257v9.462h39.299a18.12 18.12 0 01-1.55-7.36c0-2.618.535-5.055 1.55-7.359H30.453zm3.009 9.8a1.858 1.858 0 11-.004-3.716 1.858 1.858 0 01.004 3.716zm8.176 0a1.858 1.858 0 110-3.716 1.86 1.86 0 011.862 1.858 1.86 1.86 0 01-1.861 1.858zm8.179 0a1.857 1.857 0 11.002-3.715 1.857 1.857 0 01-.002 3.715z"
          fill="url(#paint10_linear_125_5456)"
        />
        <Path
          d="M34.834 62.623V80.31c0 .73.591 1.322 1.322 1.322h15.8c.731 0 1.323-.591 1.323-1.322V66.892c0-.39-.173-.761-.472-1.011l-5.079-4.27c-.239-.2-.54-.31-.85-.31H36.156c-.73 0-1.322.591-1.322 1.322z"
          fill="url(#paint11_linear_125_5456)"
        />
        <Path
          d="M34.834 90.67v17.688c0 .731.591 1.322 1.322 1.322h15.8c.731 0 1.323-.591 1.323-1.322V94.94c0-.39-.173-.761-.472-1.012l-5.079-4.269c-.239-.2-.54-.31-.85-.31H36.156c-.73 0-1.322.591-1.322 1.322z"
          fill="url(#paint12_linear_125_5456)"
        />
        <Path
          d="M124.994 111.338a24.58 24.58 0 01-3.616 4.589 24.672 24.672 0 01-4.589 3.616c-9.447 5.757-21.943 4.553-30.111-3.617-9.581-9.58-9.581-25.116 0-34.699 9.583-9.583 25.119-9.583 34.7 0 8.17 8.17 9.373 20.666 3.616 30.112v-.001z"
          fill="url(#paint13_linear_125_5456)"
        />
        <Path
          d="M130.83 80.115a32.874 32.874 0 00-3.793-4.55c-12.708-12.706-33.312-12.706-46.02.002-12.707 12.71-12.707 33.311 0 46.019a32.677 32.677 0 005.145 4.195c7.481 4.925 16.546 6.441 25.004 4.547a32.328 32.328 0 0011.403-5.004 32.833 32.833 0 008.206-8.206l.055-.08c7.649-11.078 7.651-25.844 0-36.923zm-5.838 31.223a24.637 24.637 0 01-3.614 4.588 24.575 24.575 0 01-4.589 3.615c-9.447 5.759-21.943 4.554-30.113-3.615-9.58-9.583-9.58-25.118 0-34.7 9.583-9.584 25.121-9.584 34.702-.002 8.168 8.17 9.373 20.667 3.614 30.114z"
          fill="url(#paint14_linear_125_5456)"
        />
        <Path
          d="M144.606 136.724l-4.304 4.304a2.754 2.754 0 01-3.9 0l-14.957-14.957a32.764 32.764 0 008.541-7.869l14.621 14.621a2.755 2.755 0 010 3.898l-.001.003z"
          fill="url(#paint15_linear_125_5456)"
        />
        <Path
          d="M106.558 108.016c-.743-.66-1.669-.988-2.781-.988s-2.032.33-2.775.988c-.743.662-1.117 1.502-1.117 2.532s.374 1.87 1.117 2.527c.743.66 1.668.987 2.775.987s2.038-.329 2.781-.987c.742-.657 1.112-1.501 1.112-2.527 0-1.027-.37-1.87-1.112-2.532z"
          fill="url(#paint16_linear_125_5456)"
        />
        <Path
          d="M111.282 85.232c-1.697-1.431-4.098-2.145-7.191-2.145s-5.525.776-7.244 2.32c-1.724 1.546-2.599 3.708-2.622 6.487h7.034c.027-1.042.297-1.865.813-2.477.511-.611 1.186-.917 2.019-.917 1.805 0 2.705 1.05 2.705 3.147 0 .86-.267 1.646-.801 2.358-.536.72-1.316 1.505-2.342 2.364-1.028.86-1.768 1.877-2.228 3.05-.457 1.172-.684 2.771-.684 4.797h5.954c.024-1.055.17-1.923.435-2.612.264-.687.736-1.356 1.415-2.01l2.396-2.227c1.011-.985 1.75-1.95 2.209-2.895.455-.942.684-1.989.684-3.141 0-2.635-.851-4.67-2.552-6.1v.001z"
          fill="url(#paint17_linear_125_5456)"
        />
        <Path
          d="M99.463 44.841c0 3.49-.987 6.881-2.855 9.808a18.3 18.3 0 01-7.415 6.614 18.037 18.037 0 01-7.99 1.838c-10.067 0-18.259-8.191-18.259-18.26 0-4.267 1.504-8.418 4.232-11.688a18.21 18.21 0 0114.027-6.57c10.068 0 18.26 8.192 18.26 18.258z"
          fill="url(#paint18_linear_125_5456)"
        />
        <Path
          d="M88.045 46.634c0 2.648-.594 4.69-1.784 6.127-1.19 1.436-2.866 2.154-5.03 2.154-2.163 0-3.869-.723-5.063-2.167-1.195-1.445-1.791-3.483-1.791-6.114v-3.582c0-2.648.595-4.69 1.784-6.127 1.19-1.436 2.87-2.153 5.043-2.153 2.174 0 3.856.722 5.05 2.167 1.195 1.444 1.791 3.487 1.791 6.127v3.568zm-4.537-4.161c0-1.41-.185-2.462-.553-3.159-.368-.695-.95-1.043-1.75-1.043s-1.35.322-1.704.97c-.355.646-.546 1.624-.573 2.934v5.01c0 1.463.183 2.533.553 3.212.368.677.95 1.017 1.75 1.017s1.343-.33 1.71-.99c.368-.66.557-1.695.567-3.103V42.473z"
          fill="url(#paint19_linear_125_5456)"
        />
        <Path
          d="M64.38 119.709a1.854 1.854 0 100-3.709 1.854 1.854 0 000 3.709z"
          fill="url(#paint20_linear_125_5456)"
        />
        <Path
          d="M56.782 141.838a1.583 1.583 0 10-.001-3.166 1.583 1.583 0 000 3.166z"
          fill="url(#paint21_linear_125_5456)"
        />
        <Path
          d="M117.458 136.315a2.207 2.207 0 100 4.414 2.207 2.207 0 000-4.414z"
          fill="url(#paint22_linear_125_5456)"
        />
        <Path
          d="M149.029 32.78a1.383 1.383 0 10-2.766 0 1.383 1.383 0 002.766 0z"
          fill="url(#paint23_linear_125_5456)"
        />
        <Path
          d="M138.131 78.448a3.491 3.491 0 100-6.982 3.491 3.491 0 000 6.982z"
          fill="url(#paint24_linear_125_5456)"
        />
        <Path
          d="M30.144 136.627a2.053 2.053 0 100 4.106 2.053 2.053 0 000-4.106z"
          fill="url(#paint25_linear_125_5456)"
        />
        <Path
          d="M148.616 131.959a.97.97 0 100-1.938.97.97 0 000 1.938z"
          fill="url(#paint26_linear_125_5456)"
        />
      </G>
      <Defs>
        <LinearGradient
          id="paint0_linear_125_5456"
          x1={8.09088}
          y1={18.6549}
          x2={8.09088}
          y2={140.956}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#CCD2D6" stopOpacity={0.1} />
          <Stop offset={1} stopColor="#CCD2D6" stopOpacity={0.25} />
        </LinearGradient>
        <LinearGradient
          id="paint1_linear_125_5456"
          x1={84}
          y1={18.6547}
          x2={84}
          y2={140.955}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#CCD2D6" stopOpacity={0.1} />
          <Stop offset={1} stopColor="#CCD2D6" stopOpacity={0.25} />
        </LinearGradient>
        <LinearGradient
          id="paint2_linear_125_5456"
          x1={159.91}
          y1={18.6549}
          x2={159.91}
          y2={140.956}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#CCD2D6" stopOpacity={0.1} />
          <Stop offset={1} stopColor="#CCD2D6" stopOpacity={0.25} />
        </LinearGradient>
        <LinearGradient
          id="paint3_linear_125_5456"
          x1={84}
          y1={18.6551}
          x2={84}
          y2={140.956}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#CCD2D6" stopOpacity={0.1} />
          <Stop offset={1} stopColor="#CCD2D6" stopOpacity={0.25} />
        </LinearGradient>
        <LinearGradient
          id="paint4_linear_125_5456"
          x1={10.9667}
          y1={18.6552}
          x2={10.9667}
          y2={140.956}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#CCD2D6" stopOpacity={0.1} />
          <Stop offset={1} stopColor="#CCD2D6" stopOpacity={0.25} />
        </LinearGradient>
        <LinearGradient
          id="paint5_linear_125_5456"
          x1={152.667}
          y1={18.6552}
          x2={152.667}
          y2={140.956}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#CCD2D6" stopOpacity={0.1} />
          <Stop offset={1} stopColor="#CCD2D6" stopOpacity={0.25} />
        </LinearGradient>
        <LinearGradient
          id="paint6_linear_125_5456"
          x1={20.9961}
          y1={126.592}
          x2={111.167}
          y2={126.592}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#CCD2D6" stopOpacity={0.7} />
          <Stop offset={1} stopColor="#CCD2D6" />
        </LinearGradient>
        <LinearGradient
          id="paint7_linear_125_5456"
          x1={13.1792}
          y1={50.3873}
          x2={128.221}
          y2={135.318}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#CCD2D6" stopOpacity={0.4} />
          <Stop offset={1} stopColor="#CCD2D6" stopOpacity={0.9} />
        </LinearGradient>
        <LinearGradient
          id="paint8_linear_125_5456"
          x1={58.3461}
          y1={-10.7915}
          x2={173.386}
          y2={74.1375}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#CCD2D6" stopOpacity={0.4} />
          <Stop offset={1} stopColor="#CCD2D6" stopOpacity={0.9} />
        </LinearGradient>
        <LinearGradient
          id="paint9_linear_125_5456"
          x1={88.5071}
          y1={63.436}
          x2={88.5071}
          y2={159.982}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#CCD2D6" stopOpacity={0.25} />
          <Stop offset={1} stopColor="#CCD2D6" stopOpacity={0.5} />
        </LinearGradient>
        <LinearGradient
          id="paint10_linear_125_5456"
          x1={25.1963}
          y1={44.8418}
          x2={151.82}
          y2={44.8418}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#CCD2D6" stopOpacity={0.7} />
          <Stop offset={1} stopColor="#CCD2D6" />
        </LinearGradient>
        <LinearGradient
          id="paint11_linear_125_5456"
          x1={44.1093}
          y1={73.5261}
          x2={105.362}
          y2={122.167}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#CCD2D6" stopOpacity={0.4} />
          <Stop offset={1} stopColor="#CCD2D6" stopOpacity={0.9} />
        </LinearGradient>
        <LinearGradient
          id="paint12_linear_125_5456"
          x1={30.4509}
          y1={90.7262}
          x2={91.702}
          y2={139.367}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#CCD2D6" stopOpacity={0.4} />
          <Stop offset={1} stopColor="#CCD2D6" stopOpacity={0.9} />
        </LinearGradient>
        <LinearGradient
          id="paint13_linear_125_5456"
          x1={94.3287}
          y1={76.7684}
          x2={128.557}
          y2={153.721}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#CCD2D6" stopOpacity={0.25} />
          <Stop offset={1} stopColor="#CCD2D6" stopOpacity={0.5} />
        </LinearGradient>
        <LinearGradient
          id="paint14_linear_125_5456"
          x1={92.8468}
          y1={52.2032}
          x2={119.097}
          y2={161.067}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#CCD2D6" stopOpacity={0.4} />
          <Stop offset={1} stopColor="#CCD2D6" stopOpacity={0.9} />
        </LinearGradient>
        <LinearGradient
          id="paint15_linear_125_5456"
          x1={121.444}
          y1={130.021}
          x2={145.414}
          y2={130.021}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#CCD2D6" stopOpacity={0.7} />
          <Stop offset={1} stopColor="#CCD2D6" />
        </LinearGradient>
        <LinearGradient
          id="paint16_linear_125_5456"
          x1={103.777}
          y1={87.3706}
          x2={103.777}
          y2={128.336}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#CCD2D6" stopOpacity={0.7} />
          <Stop offset={1} stopColor="#CCD2D6" />
        </LinearGradient>
        <LinearGradient
          id="paint17_linear_125_5456"
          x1={104.029}
          y1={87.3709}
          x2={104.029}
          y2={128.336}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#CCD2D6" stopOpacity={0.7} />
          <Stop offset={1} stopColor="#CCD2D6" />
        </LinearGradient>
        <LinearGradient
          id="paint18_linear_125_5456"
          x1={81.2026}
          y1={26.2907}
          x2={81.2026}
          y2={59.1061}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#CCD2D6" stopOpacity={0.25} />
          <Stop offset={1} stopColor="#CCD2D6" stopOpacity={0.5} />
        </LinearGradient>
        <LinearGradient
          id="paint19_linear_125_5456"
          x1={81.2112}
          y1={38.1869}
          x2={81.2112}
          y2={50.4593}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#CCD2D6" stopOpacity={0.7} />
          <Stop offset={1} stopColor="#CCD2D6" />
        </LinearGradient>
        <LinearGradient
          id="paint20_linear_125_5456"
          x1={64.3791}
          y1={54.9437}
          x2={64.3791}
          y2={155.835}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#CCD2D6" stopOpacity={0.7} />
          <Stop offset={1} stopColor="#CCD2D6" />
        </LinearGradient>
        <LinearGradient
          id="paint21_linear_125_5456"
          x1={56.7818}
          y1={54.9432}
          x2={56.7818}
          y2={155.834}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#CCD2D6" stopOpacity={0.7} />
          <Stop offset={1} stopColor="#CCD2D6" />
        </LinearGradient>
        <LinearGradient
          id="paint22_linear_125_5456"
          x1={117.458}
          y1={54.943}
          x2={117.458}
          y2={155.834}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#CCD2D6" stopOpacity={0.7} />
          <Stop offset={1} stopColor="#CCD2D6" />
        </LinearGradient>
        <LinearGradient
          id="paint23_linear_125_5456"
          x1={147.646}
          y1={54.9434}
          x2={147.646}
          y2={155.834}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#CCD2D6" stopOpacity={0.7} />
          <Stop offset={1} stopColor="#CCD2D6" />
        </LinearGradient>
        <LinearGradient
          id="paint24_linear_125_5456"
          x1={138.131}
          y1={54.943}
          x2={138.131}
          y2={155.834}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#CCD2D6" stopOpacity={0.7} />
          <Stop offset={1} stopColor="#CCD2D6" />
        </LinearGradient>
        <LinearGradient
          id="paint25_linear_125_5456"
          x1={30.1438}
          y1={54.9437}
          x2={30.1438}
          y2={155.834}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#CCD2D6" stopOpacity={0.7} />
          <Stop offset={1} stopColor="#CCD2D6" />
        </LinearGradient>
        <LinearGradient
          id="paint26_linear_125_5456"
          x1={148.616}
          y1={54.9431}
          x2={148.616}
          y2={155.834}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#CCD2D6" stopOpacity={0.7} />
          <Stop offset={1} stopColor="#CCD2D6" />
        </LinearGradient>
        <ClipPath id="clip0_125_5456">
          <Path fill="#fff" d="M0 0H168V168H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  )
}

export default EmptyIcon
