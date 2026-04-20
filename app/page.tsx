"use client"

import Image from 'next/image';
import { useEffect, useState } from 'react';
import svgPaths from "./imports/svg-pftphcbr1j";
import imgMoviePoster from "./imports/693faa473f27747a26199d53fbdd83da54af2322.png";
import imgMoviePoster1 from "./imports/8438a0d6694b198f9903cc656aa29f254f51c7f3.png";
import imgMoviePoster2 from "./imports/4476fcf216e10f8cee92560cbcbef0e3d2962f33.png";
import imgAdminUserProfile from "./imports/3fb50e400b2b6d54919ffe102df8bdacc2f76918.png";
import { useRouter } from 'next/navigation';

type Movie = {
  id: number | string;
  title?: string;
  name?: string;
  genre?: string;
  duration?: string;
  releaseDate?: string;
  release_date?: string;
  status?: string;
  poster?: string;
  posterUrl?: string;
  image?: string;
  hall?: string;
};

function Heading() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 2">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#2d3337] text-[44px] tracking-[-1.1px] w-full">
        <p className="leading-[55px]">Dashboard Overview</p>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#596063] text-[14px] w-full">
        <p className="leading-[20px]">Real-time performance metrics for Cinema (All Branches).</p>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full" data-name="Container">
      <Heading />
      <Container1 />
    </div>
  );
}

function Overlay() {
  return (
    <div className="h-[32px] relative shrink-0 w-[38px]" data-name="Overlay">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 38 32">
        <g id="Overlay">
          <rect fill="var(--fill-0, #4A4BD7)" fillOpacity="0.1" height="32" rx="12" width="38" />
          <path d={svgPaths.p3f437800} fill="var(--fill-0, #4A4BD7)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container3() {
  return (
    <div className="h-[6px] relative shrink-0 w-[10px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 6">
        <g id="Container">
          <path d={svgPaths.p313692c0} fill="var(--fill-0, #006D4A)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Overlay1() {
  return (
    <div className="bg-[rgba(111,251,190,0.2)] content-stretch flex gap-[4px] items-center px-[8px] py-[4px] relative rounded-[9999px] shrink-0" data-name="Overlay">
      <Container3 />
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#006d4a] text-[12px] w-[36.42px]">
        <p className="leading-[16px]">12.4%</p>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="absolute content-stretch flex items-start justify-between left-[24px] right-[24px] top-[24px]" data-name="Container">
      <Overlay />
      <Overlay1 />
    </div>
  );
}

function Container4() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[24px] right-[24px] top-[80px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-[rgba(89,96,99,0.6)] tracking-[1.2px] uppercase w-[114.27px]">
        <p className="leading-[16px]">Total Revenue</p>
      </div>
    </div>
  );
}

function Heading1() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[24px] right-[24px] top-[100px]" data-name="Heading 3">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold h-[32px] justify-center leading-[0] not-italic relative shrink-0 text-[#2d3337] text-[24px] w-[150.39px]">
        <p className="leading-[32px]">$142,384.50</p>
      </div>
    </div>
  );
}

function Svg() {
  return <div className="h-[32px] shrink-0 w-full" data-name="SVG" />;
}

function Container5() {
  return (
    <div className="absolute content-stretch flex flex-col h-[32px] items-start justify-center left-[24px] right-[24px] top-[148px]" data-name="Container">
      <Svg />
    </div>
  );
}

function Card() {
  return (
    <div className="bg-white col-1 h-[204px] justify-self-stretch relative rounded-[16px] row-1 shadow-[0px_12px_32px_0px_rgba(45,51,55,0.06)] shrink-0" data-name="Card 1">
      <Container2 />
      <Container4 />
      <Heading1 />
      <Container5 />
    </div>
  );
}

function Overlay2() {
  return (
    <div className="h-[32px] relative shrink-0 w-[36px]" data-name="Overlay">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 36 32">
        <g id="Overlay">
          <rect fill="var(--fill-0, #842CD3)" fillOpacity="0.1" height="32" rx="12" width="36" />
          <path d={svgPaths.p38027400} fill="var(--fill-0, #842CD3)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container7() {
  return (
    <div className="h-[6px] relative shrink-0 w-[10px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 6">
        <g id="Container">
          <path d={svgPaths.p313692c0} fill="var(--fill-0, #006D4A)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Overlay3() {
  return (
    <div className="bg-[rgba(111,251,190,0.2)] content-stretch flex gap-[4px] items-center px-[8px] py-[4px] relative rounded-[9999px] shrink-0" data-name="Overlay">
      <Container7 />
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#006d4a] text-[12px] w-[27.31px]">
        <p className="leading-[16px]">8.1%</p>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="absolute content-stretch flex items-start justify-between left-[24px] right-[24px] top-[24px]" data-name="Container">
      <Overlay2 />
      <Overlay3 />
    </div>
  );
}

function Container8() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[24px] right-[24px] top-[80px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-[rgba(89,96,99,0.6)] tracking-[1.2px] uppercase w-[101.78px]">
        <p className="leading-[16px]">Tickets Sold</p>
      </div>
    </div>
  );
}

function Heading2() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[24px] right-[24px] top-[100px]" data-name="Heading 3">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold h-[32px] justify-center leading-[0] not-italic relative shrink-0 text-[#2d3337] text-[24px] w-[80.84px]">
        <p className="leading-[32px]">12,840</p>
      </div>
    </div>
  );
}

function Svg1() {
  return <div className="h-[32px] shrink-0 w-full" data-name="SVG" />;
}

function Container9() {
  return (
    <div className="absolute content-stretch flex flex-col h-[32px] items-start justify-center left-[24px] right-[24px] top-[148px]" data-name="Container">
      <Svg1 />
    </div>
  );
}

function Card1() {
  return (
    <div className="bg-white col-2 h-[204px] justify-self-stretch relative rounded-[16px] row-1 shadow-[0px_12px_32px_0px_rgba(45,51,55,0.06)] shrink-0" data-name="Card 2">
      <Container6 />
      <Container8 />
      <Heading2 />
      <Container9 />
    </div>
  );
}

function Overlay4() {
  return (
    <div className="h-[32px] relative shrink-0 w-[36px]" data-name="Overlay">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 36 32">
        <g id="Overlay">
          <rect fill="var(--fill-0, #006D4A)" fillOpacity="0.1" height="32" rx="12" width="36" />
          <path d={svgPaths.p349bd800} fill="var(--fill-0, #006D4A)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Overlay5() {
  return (
    <div className="bg-[rgba(234,238,241,0.5)] content-stretch flex items-center px-[8px] py-[4px] relative rounded-[9999px] shrink-0" data-name="Overlay">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-[rgba(89,96,99,0.6)] w-[36.72px]">
        <p className="leading-[16px]">Stable</p>
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="absolute content-stretch flex items-start justify-between left-[24px] right-[24px] top-[24px]" data-name="Container">
      <Overlay4 />
      <Overlay5 />
    </div>
  );
}

function Container11() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[24px] right-[24px] top-[80px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-[rgba(89,96,99,0.6)] tracking-[1.2px] uppercase w-[110.83px]">
        <p className="leading-[16px]">Active Movies</p>
      </div>
    </div>
  );
}

function Heading3() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[24px] right-[24px] top-[100px]" data-name="Heading 3">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold h-[32px] justify-center leading-[0] not-italic relative shrink-0 text-[#2d3337] text-[24px] w-[30.98px]">
        <p className="leading-[32px]">24</p>
      </div>
    </div>
  );
}

function Svg2() {
  return <div className="h-[32px] shrink-0 w-full" data-name="SVG" />;
}

function Container12() {
  return (
    <div className="absolute content-stretch flex flex-col h-[32px] items-start justify-center left-[24px] right-[24px] top-[148px]" data-name="Container">
      <Svg2 />
    </div>
  );
}

function Card2() {
  return (
    <div className="bg-white col-3 h-[204px] justify-self-stretch relative rounded-[16px] row-1 shadow-[0px_12px_32px_0px_rgba(45,51,55,0.06)] shrink-0" data-name="Card 3">
      <Container10 />
      <Container11 />
      <Heading3 />
      <Container12 />
    </div>
  );
}

function Overlay6() {
  return (
    <div className="h-[32px] relative shrink-0 w-[38px]" data-name="Overlay">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 38 32">
        <g id="Overlay">
          <rect fill="var(--fill-0, #AC3149)" fillOpacity="0.1" height="32" rx="12" width="38" />
          <path d={svgPaths.p2be64098} fill="var(--fill-0, #AC3149)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container14() {
  return (
    <div className="h-[6px] relative shrink-0 w-[10px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 6">
        <g id="Container">
          <path d={svgPaths.p313692c0} fill="var(--fill-0, #006D4A)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Overlay7() {
  return (
    <div className="bg-[rgba(111,251,190,0.2)] content-stretch flex gap-[4px] items-center px-[8px] py-[4px] relative rounded-[9999px] shrink-0" data-name="Overlay">
      <Container14 />
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#006d4a] text-[12px] w-[27.34px]">
        <p className="leading-[16px]">24%</p>
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="absolute content-stretch flex items-start justify-between left-[24px] right-[24px] top-[24px]" data-name="Container">
      <Overlay6 />
      <Overlay7 />
    </div>
  );
}

function Container15() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[24px] right-[24px] top-[80px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-[rgba(89,96,99,0.6)] tracking-[1.2px] uppercase w-[87.31px]">
        <p className="leading-[16px]">Customers</p>
      </div>
    </div>
  );
}

function Heading4() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[24px] right-[24px] top-[100px]" data-name="Heading 3">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold h-[32px] justify-center leading-[0] not-italic relative shrink-0 text-[#2d3337] text-[24px] w-[86.27px]">
        <p className="leading-[32px]">48,290</p>
      </div>
    </div>
  );
}

function Svg3() {
  return <div className="h-[32px] shrink-0 w-full" data-name="SVG" />;
}

function Container16() {
  return (
    <div className="absolute content-stretch flex flex-col h-[32px] items-start justify-center left-[24px] right-[24px] top-[148px]" data-name="Container">
      <Svg3 />
    </div>
  );
}

function Card3() {
  return (
    <div className="bg-white col-4 h-[204px] justify-self-stretch relative rounded-[16px] row-1 shadow-[0px_12px_32px_0px_rgba(45,51,55,0.06)] shrink-0" data-name="Card 4">
      <Container13 />
      <Container15 />
      <Heading4 />
      <Container16 />
    </div>
  );
}

function KpiCardsGrid() {
  return (
    <div className="gap-x-[24px] gap-y-[24px] grid grid-cols-[repeat(4,minmax(0,1fr))] grid-rows-[_204px] relative shrink-0 w-full" data-name="KPI Cards Grid">
      <Card />
      <Card1 />
      <Card2 />
      <Card3 />
    </div>
  );
}

function Heading5() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 4">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[#2d3337] text-[18px] w-[164.05px]">
        <p className="leading-[28px]">Revenue Analytics</p>
      </div>
    </div>
  );
}

function Container19() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#596063] text-[12px] w-[238.3px]">
        <p className="leading-[16px]">Daily revenue trends over the last 30 days</p>
      </div>
    </div>
  );
}

function Container18() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[238.3px]" data-name="Container">
      <Heading5 />
      <Container19 />
    </div>
  );
}

function Button() {
  return (
    <div className="bg-[#f1f4f6] content-stretch flex flex-col items-center justify-center px-[12px] py-[4px] relative rounded-[8px] shrink-0" data-name="Button">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#596063] text-[12px] text-center w-[37.92px]">
        <p className="leading-[16px]">Month</p>
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-[#4a4bd7] content-stretch flex flex-col items-center justify-center px-[12px] py-[4px] relative rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0" data-name="Button">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#fbf7ff] text-[12px] text-center w-[33.13px]">
        <p className="leading-[16px]">Week</p>
      </div>
    </div>
  );
}

function Container20() {
  return (
    <div className="content-stretch flex gap-[8.01px] items-start relative shrink-0" data-name="Container">
      <Button />
      <Button1 />
    </div>
  );
}

function Container17() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container18 />
      <Container20 />
    </div>
  );
}

function SimulatedChartBarsLines() {
  return (
    <div className="bg-[rgba(186,187,255,0.2)] flex-[1_0_0] h-[102.39px] min-h-px min-w-px relative rounded-tl-[8px] rounded-tr-[8px]" data-name="Simulated Chart Bars/Lines">
      <div className="absolute bg-[rgba(74,75,215,0.4)] bottom-0 left-0 right-[0.43px] rounded-tl-[8px] rounded-tr-[8px] top-1/2" data-name="Overlay" />
    </div>
  );
}

function Overlay8() {
  return (
    <div className="bg-[rgba(186,187,255,0.2)] flex-[1_0_0] h-[140.8px] min-h-px min-w-px relative rounded-tl-[8px] rounded-tr-[8px]" data-name="Overlay">
      <div className="absolute bg-[rgba(74,75,215,0.4)] inset-[33.34%_0.43px_0_0] rounded-tl-[8px] rounded-tr-[8px]" data-name="Overlay" />
    </div>
  );
}

function Overlay9() {
  return (
    <div className="bg-[rgba(186,187,255,0.2)] flex-[1_0_0] h-[192px] min-h-px min-w-px relative rounded-tl-[8px] rounded-tr-[8px]" data-name="Overlay">
      <div className="absolute bg-[rgba(74,75,215,0.4)] bottom-0 left-0 right-[0.43px] rounded-tl-[8px] rounded-tr-[8px] top-1/4" data-name="Overlay" />
    </div>
  );
}

function Overlay10() {
  return (
    <div className="bg-[rgba(186,187,255,0.2)] flex-[1_0_0] h-[153.59px] min-h-px min-w-px relative rounded-tl-[8px] rounded-tr-[8px]" data-name="Overlay">
      <div className="absolute bg-[rgba(74,75,215,0.4)] bottom-0 left-0 right-[0.43px] rounded-tl-[8px] rounded-tr-[8px] top-1/2" data-name="Overlay" />
    </div>
  );
}

function Overlay11() {
  return (
    <div className="bg-[rgba(186,187,255,0.2)] flex-[1_0_0] h-[230.39px] min-h-px min-w-px relative rounded-tl-[8px] rounded-tr-[8px]" data-name="Overlay">
      <div className="absolute bg-[rgba(74,75,215,0.4)] inset-[20%_0.43px_0_0] rounded-tl-[8px] rounded-tr-[8px]" data-name="Overlay" />
    </div>
  );
}

function Overlay12() {
  return (
    <div className="bg-[rgba(186,187,255,0.2)] flex-[1_0_0] h-[179.19px] min-h-px min-w-px relative rounded-tl-[8px] rounded-tr-[8px]" data-name="Overlay">
      <div className="absolute bg-[rgba(74,75,215,0.4)] inset-[33.34%_0.43px_0_0] rounded-tl-[8px] rounded-tr-[8px]" data-name="Overlay" />
    </div>
  );
}

function Overlay13() {
  return (
    <div className="bg-[rgba(186,187,255,0.2)] flex-[1_0_0] h-[217.59px] min-h-px min-w-px relative rounded-tl-[8px] rounded-tr-[8px]" data-name="Overlay">
      <div className="absolute bg-[rgba(74,75,215,0.4)] inset-[16.66%_0.43px_0_0] rounded-tl-[8px] rounded-tr-[8px]" data-name="Overlay" />
    </div>
  );
}

function Container21() {
  return (
    <div className="content-stretch flex h-[256px] items-end justify-between relative shrink-0 w-full" data-name="Container">
      <SimulatedChartBarsLines />
      <Overlay8 />
      <Overlay9 />
      <Overlay10 />
      <Overlay11 />
      <Overlay12 />
      <Overlay13 />
    </div>
  );
}

function LineChartRevenue() {
  return (
    <div className="bg-white col-[1/span_2] justify-self-stretch relative rounded-[16px] row-1 self-start shadow-[0px_12px_32px_0px_rgba(45,51,55,0.06)] shrink-0" data-name="Line Chart: Revenue">
      <div className="content-stretch flex flex-col gap-[32px] items-start pb-[68px] pt-[24px] px-[24px] relative w-full">
        <Container17 />
        <Container21 />
      </div>
    </div>
  );
}

function Heading6() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 4">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#2d3337] text-[18px] w-full">
        <p className="leading-[28px]">Seat Occupancy</p>
      </div>
    </div>
  );
}

function Heading4Margin() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[24px] pb-[4px] right-[24px] top-[24px]" data-name="Heading 4:margin">
      <Heading6 />
    </div>
  );
}

function Container22() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#596063] text-[12px] w-full">
        <p className="leading-[16px]">Average by screening type</p>
      </div>
    </div>
  );
}

function Margin() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[24px] pb-[32px] right-[24px] top-[56px]" data-name="Margin">
      <Container22 />
    </div>
  );
}

function Container26() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#596063] text-[12px] w-[82.45px]">
        <p className="leading-[16px]">Standard Halls</p>
      </div>
    </div>
  );
}

function Container25() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Container">
      <div className="bg-[#4a4bd7] rounded-[9999px] shrink-0 size-[8px]" data-name="Background" />
      <Container26 />
    </div>
  );
}

function Container27() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#2d3337] text-[12px] w-[27.45px]">
        <p className="leading-[16px]">65%</p>
      </div>
    </div>
  );
}

function Container24() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between relative w-full">
          <Container25 />
          <Container27 />
        </div>
      </div>
    </div>
  );
}

function Container30() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#596063] text-[12px] w-[57.39px]">
        <p className="leading-[16px]">VIP Suites</p>
      </div>
    </div>
  );
}

function Container29() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Container">
      <div className="bg-[#842cd3] rounded-[9999px] shrink-0 size-[8px]" data-name="Background" />
      <Container30 />
    </div>
  );
}

function Container31() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#2d3337] text-[12px] w-[27.22px]">
        <p className="leading-[16px]">25%</p>
      </div>
    </div>
  );
}

function Container28() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between relative w-full">
          <Container29 />
          <Container31 />
        </div>
      </div>
    </div>
  );
}

function Container34() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#596063] text-[12px] w-[95.33px]">
        <p className="leading-[16px]">Private Bookings</p>
      </div>
    </div>
  );
}

function Container33() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Container">
      <div className="bg-[#eaeef1] rounded-[9999px] shrink-0 size-[8px]" data-name="Background" />
      <Container34 />
    </div>
  );
}

function Container35() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#2d3337] text-[12px] w-[25.45px]">
        <p className="leading-[16px]">10%</p>
      </div>
    </div>
  );
}

function Container32() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between relative w-full">
          <Container33 />
          <Container35 />
        </div>
      </div>
    </div>
  );
}

function Container23() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="Container">
      <Container24 />
      <Container28 />
      <Container32 />
    </div>
  );
}

function Margin1() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[24px] pt-[32px] right-[24px] top-[296px]" data-name="Margin">
      <Container23 />
    </div>
  );
}

function Svg4() {
  return (
    <div className="relative shrink-0 size-[192px]" data-name="SVG">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 192 192">
        <g clipPath="url(#clip0_1_398)" id="SVG">
          <path d={svgPaths.p376d7e00} id="Vector" stroke="var(--stroke-0, #EAEEF1)" strokeDasharray="533.33 533.33" strokeWidth="16" />
          <path d={svgPaths.p376d7e00} id="Vector_2" stroke="var(--stroke-0, #4A4BD7)" strokeDasharray="346.67 533.33" strokeLinecap="round" strokeWidth="21.3333" />
          <path d={svgPaths.p376d7e00} id="Vector_3" stroke="var(--stroke-0, #842CD3)" strokeDasharray="133.33 533.33" strokeLinecap="round" strokeWidth="21.3333" />
        </g>
        <defs>
          <clipPath id="clip0_1_398">
            <rect fill="white" height="192" width="192" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container38() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Extra_Bold',sans-serif] font-extrabold h-[32px] justify-center leading-[0] not-italic relative shrink-0 text-[#2d3337] text-[24px] w-[54.42px]">
        <p className="leading-[32px]">78%</p>
      </div>
    </div>
  );
}

function Container39() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-[rgba(89,96,99,0.6)] uppercase w-[47.42px]">
        <p className="leading-[15px]">Average</p>
      </div>
    </div>
  );
}

function Container37() {
  return (
    <div className="absolute content-stretch flex flex-col inset-0 items-center justify-center" data-name="Container">
      <Container38 />
      <Container39 />
    </div>
  );
}

function Container36() {
  return (
    <div className="absolute content-stretch flex items-center justify-center left-[24px] right-[24px] top-[104px]" data-name="Container">
      <Svg4 />
      <Container37 />
    </div>
  );
}

function PieChartOccupancy() {
  return (
    <div className="bg-white col-3 h-[424px] justify-self-stretch relative rounded-[16px] row-1 shadow-[0px_12px_32px_0px_rgba(45,51,55,0.06)] shrink-0" data-name="Pie Chart: Occupancy">
      <Heading4Margin />
      <Margin />
      <Margin1 />
      <Container36 />
    </div>
  );
}

function BentoChartsLayout() {
  return (
    <div className="gap-x-[24px] gap-y-[24px] grid grid-cols-[repeat(3,minmax(0,1fr))] grid-rows-[_424px] relative shrink-0 w-full" data-name="Bento Charts Layout">
      <LineChartRevenue />
      <PieChartOccupancy />
    </div>
  );
}

function Heading7() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Heading 4">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[#2d3337] text-[18px] w-[125.95px]">
        <p className="leading-[28px]">Recent Orders</p>
      </div>
    </div>
  );
}

function Button2() {
  const router = useRouter();
  return (
    <div 
      onClick={() => router.push('/orders')} 
      className="content-stretch flex flex-col items-center justify-center relative shrink-0 cursor-pointer hover:opacity-70 hover:underline transition-all" 
      data-name="Button"
    >
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#4a4bd7] text-[12px] text-center w-[90.7px]">
        <p className="leading-[16px]">View All Orders</p>
      </div>
    </div>
  );
}

function Container40() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Heading7 />
      <Button2 />
    </div>
  );
}

function Cell() {
  return (
    <div className="content-stretch flex flex-col items-start mr-[-0.5px] pb-[12px] pt-px px-px relative shrink-0 w-[122.25px]" data-name="Cell">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold h-[12px] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-[rgba(89,96,99,0.6)] tracking-[1px] uppercase w-[100.38px]">
        <p className="leading-[normal]">Transaction ID</p>
      </div>
    </div>
  );
}

function Cell1() {
  return (
    <div className="content-stretch flex flex-col items-start mr-[-0.5px] pb-[12px] pt-px px-px relative shrink-0 w-[165.19px]" data-name="Cell">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold h-[12px] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-[rgba(89,96,99,0.6)] tracking-[1px] uppercase w-[65.22px]">
        <p className="leading-[normal]">Customer</p>
      </div>
    </div>
  );
}

function Cell2() {
  return (
    <div className="content-stretch flex flex-col items-start mr-[-0.5px] pb-[12px] pt-px px-px relative shrink-0 w-[145.36px]" data-name="Cell">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold h-[12px] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-[rgba(89,96,99,0.6)] tracking-[1px] uppercase w-[37.98px]">
        <p className="leading-[normal]">Movie</p>
      </div>
    </div>
  );
}

function Cell3() {
  return (
    <div className="content-stretch flex flex-col items-start mr-[-0.5px] pb-[12px] pt-px px-px relative shrink-0 w-[86.97px]" data-name="Cell">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold h-[12px] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-[rgba(89,96,99,0.6)] tracking-[1px] uppercase w-[45.39px]">
        <p className="leading-[normal]">Status</p>
      </div>
    </div>
  );
}

function Cell4() {
  return (
    <div className="content-stretch flex flex-col items-end mr-[-0.5px] pb-[12px] pt-px px-px relative shrink-0 w-[64.72px]" data-name="Cell">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold h-[12px] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-[rgba(89,96,99,0.6)] text-right tracking-[1px] uppercase w-[52.11px]">
        <p className="leading-[normal]">Amount</p>
      </div>
    </div>
  );
}

function Row() {
  return (
    <div className="relative shrink-0 w-full" data-name="Row">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start justify-center pr-[0.5px] relative w-full">
        <Cell />
        <Cell1 />
        <Cell2 />
        <Cell3 />
        <Cell4 />
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="content-stretch flex flex-col items-start mb-[-1px] pb-px relative shrink-0 w-full" data-name="Header">
      <div aria-hidden="true" className="absolute border-[#e3e9ec] border-b border-solid inset-0 pointer-events-none" />
      <Row />
    </div>
  );
}

function Data() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[23px] pt-[22px] px-px relative shrink-0 w-[121.77px]" data-name="Data">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#2d3337] text-[14px] w-[74.31px]">
        <p className="leading-[20px]">#LC-82910</p>
      </div>
    </div>
  );
}

function Background() {
  return (
    <div className="bg-[#e0e7ff] content-stretch flex items-center justify-center relative rounded-[9999px] shrink-0 size-[32px]" data-name="Background">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold h-[12px] justify-center leading-[0] not-italic relative shrink-0 text-[#4f46e5] text-[10px] text-center w-[15.88px]">
        <p className="leading-[normal]">SM</p>
      </div>
    </div>
  );
}

function Container41() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#2d3337] text-[14px] w-[80.47px]">
        <p className="leading-[20px]">Sarah Miller</p>
      </div>
    </div>
  );
}

function Data1() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-[163.19px]" data-name="Data">
      <Background />
      <Container41 />
    </div>
  );
}

function Data2() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[23px] pt-[22px] px-px relative shrink-0 w-[145.36px]" data-name="Data">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#596063] text-[14px] w-[119.59px]">
        <p className="leading-[20px]">Interstellar (IMAX)</p>
      </div>
    </div>
  );
}

function Overlay14() {
  return (
    <div className="bg-[rgba(111,251,190,0.2)] content-stretch flex items-start px-[8px] py-[4px] relative rounded-[9999px] shrink-0" data-name="Overlay">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold h-[12px] justify-center leading-[0] not-italic relative shrink-0 text-[#006d4a] text-[10px] w-[52.06px]">
        <p className="leading-[normal]">Confirmed</p>
      </div>
    </div>
  );
}

function Data3() {
  return (
    <div className="content-stretch flex flex-col items-start pr-px py-[22.5px] relative shrink-0 w-[85.97px]" data-name="Data">
      <Overlay14 />
    </div>
  );
}

function Data4() {
  return (
    <div className="content-stretch flex flex-col items-end pb-[23px] pt-[22px] px-px relative shrink-0 w-[63.72px]" data-name="Data">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#2d3337] text-[14px] text-right w-[50.19px]">
        <p className="leading-[20px]">$45.00</p>
      </div>
    </div>
  );
}

function Row1() {
  return (
    <div className="content-stretch flex gap-px items-center justify-center mb-[-1px] relative shrink-0 w-full" data-name="Row">
      <Data />
      <Data1 />
      <Data2 />
      <Data3 />
      <Data4 />
    </div>
  );
}

function Data5() {
  return (
    <div className="relative shrink-0 w-[121.77px]" data-name="Data">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[23px] pt-[22px] px-px relative w-full">
        <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#2d3337] text-[14px] w-[71.09px]">
          <p className="leading-[20px]">#LC-82911</p>
        </div>
      </div>
    </div>
  );
}

function Background1() {
  return (
    <div className="bg-[#f3e8ff] content-stretch flex items-center justify-center relative rounded-[9999px] shrink-0 size-[32px]" data-name="Background">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold h-[12px] justify-center leading-[0] not-italic relative shrink-0 text-[#9333ea] text-[10px] text-center w-[13.08px]">
        <p className="leading-[normal]">JD</p>
      </div>
    </div>
  );
}

function Container42() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#2d3337] text-[14px] w-[92.17px]">
        <p className="leading-[20px]">James Dalton</p>
      </div>
    </div>
  );
}

function Data6() {
  return (
    <div className="relative shrink-0 w-[163.19px]" data-name="Data">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[12px] items-center relative w-full">
        <Background1 />
        <Container42 />
      </div>
    </div>
  );
}

function Data7() {
  return (
    <div className="relative shrink-0 w-[145.36px]" data-name="Data">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[23px] pt-[22px] px-px relative w-full">
        <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#596063] text-[14px] w-[101.36px]">
          <p className="leading-[20px]">Dune: Part Two</p>
        </div>
      </div>
    </div>
  );
}

function Overlay15() {
  return (
    <div className="bg-[rgba(186,187,255,0.2)] content-stretch flex items-start px-[8px] py-[4px] relative rounded-[9999px] shrink-0" data-name="Overlay">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold h-[12px] justify-center leading-[0] not-italic relative shrink-0 text-[#4a4bd7] text-[10px] w-[54.75px]">
        <p className="leading-[normal]">Processing</p>
      </div>
    </div>
  );
}

function Data8() {
  return (
    <div className="relative shrink-0 w-[85.97px]" data-name="Data">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pr-px py-[22.5px] relative w-full">
        <Overlay15 />
      </div>
    </div>
  );
}

function Data9() {
  return (
    <div className="relative shrink-0 w-[63.72px]" data-name="Data">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-end pb-[23px] pt-[22px] px-px relative w-full">
        <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#2d3337] text-[14px] text-right w-[49.55px]">
          <p className="leading-[20px]">$28.50</p>
        </div>
      </div>
    </div>
  );
}

function Row2() {
  return (
    <div className="content-stretch flex gap-px items-center justify-center mb-[-1px] pt-px relative shrink-0 w-full" data-name="Row">
      <div aria-hidden="true" className="absolute border-[#f1f4f6] border-solid border-t inset-0 pointer-events-none" />
      <Data5 />
      <Data6 />
      <Data7 />
      <Data8 />
      <Data9 />
    </div>
  );
}

function Data10() {
  return (
    <div className="relative shrink-0 w-[121.77px]" data-name="Data">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[22.5px] pt-[22px] px-px relative w-full">
        <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#2d3337] text-[14px] w-[73.91px]">
          <p className="leading-[20px]">#LC-82912</p>
        </div>
      </div>
    </div>
  );
}

function Background2() {
  return (
    <div className="bg-[#fce7f3] content-stretch flex items-center justify-center relative rounded-[9999px] shrink-0 size-[32px]" data-name="Background">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold h-[12px] justify-center leading-[0] not-italic relative shrink-0 text-[#db2777] text-[10px] text-center w-[16.45px]">
        <p className="leading-[normal]">EW</p>
      </div>
    </div>
  );
}

function Container43() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#2d3337] text-[14px] w-[77.44px]">
        <p className="leading-[20px]">Elena Wells</p>
      </div>
    </div>
  );
}

function Data11() {
  return (
    <div className="relative shrink-0 w-[163.19px]" data-name="Data">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[12px] items-center relative w-full">
        <Background2 />
        <Container43 />
      </div>
    </div>
  );
}

function Data12() {
  return (
    <div className="relative shrink-0 w-[145.36px]" data-name="Data">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[22.5px] pt-[22px] px-px relative w-full">
        <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#596063] text-[14px] w-[42.64px]">
          <p className="leading-[20px]">Barbie</p>
        </div>
      </div>
    </div>
  );
}

function Overlay16() {
  return (
    <div className="bg-[rgba(111,251,190,0.2)] content-stretch flex items-start px-[8px] py-[4px] relative rounded-[9999px] shrink-0" data-name="Overlay">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold h-[12px] justify-center leading-[0] not-italic relative shrink-0 text-[#006d4a] text-[10px] w-[52.06px]">
        <p className="leading-[normal]">Confirmed</p>
      </div>
    </div>
  );
}

function Data13() {
  return (
    <div className="relative shrink-0 w-[85.97px]" data-name="Data">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[22px] pr-px pt-[22.5px] relative w-full">
        <Overlay16 />
      </div>
    </div>
  );
}

function Data14() {
  return (
    <div className="relative shrink-0 w-[63.72px]" data-name="Data">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-end pb-[22.5px] pt-[22px] px-px relative w-full">
        <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#2d3337] text-[14px] text-right w-[47.17px]">
          <p className="leading-[20px]">$12.00</p>
        </div>
      </div>
    </div>
  );
}

function Row3() {
  return (
    <div className="content-stretch flex gap-px items-center justify-center mb-[-1px] pt-px relative shrink-0 w-full" data-name="Row">
      <div aria-hidden="true" className="absolute border-[#f1f4f6] border-solid border-t inset-0 pointer-events-none" />
      <Data10 />
      <Data11 />
      <Data12 />
      <Data13 />
      <Data14 />
    </div>
  );
}

function Body() {
  return (
    <div className="content-stretch flex flex-col items-start mb-[-1px] pb-px relative shrink-0 w-full" data-name="Body">
      <Row1 />
      <Row2 />
      <Row3 />
    </div>
  );
}

function Table() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip pb-px relative shrink-0 w-full" data-name="Table">
      <Header />
      <Body />
    </div>
  );
}

function RecentOrdersTable() {
  return (
    <div className="bg-white col-[1/span_2] justify-self-stretch relative rounded-[16px] row-1 self-start shadow-[0px_12px_32px_0px_rgba(45,51,55,0.06)] shrink-0" data-name="Recent Orders Table">
      <div className="content-stretch flex flex-col gap-[24px] items-start pb-[124px] pt-[24px] px-[24px] relative w-full">
        <Container40 />
        <Table />
      </div>
    </div>
  );
}

function Heading8() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Heading 4">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[#2d3337] text-[18px] w-[138.16px]">
        <p className="leading-[28px]">Latest Releases</p>
      </div>
    </div>
  );
}

function Button3() {
  const router = useRouter();
  return (
    <div 
      onClick={() => router.push('/movies')} 
      className="content-stretch flex flex-col items-center justify-center relative shrink-0 cursor-pointer hover:opacity-70 hover:underline transition-all" 
      data-name="Button"
    >
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#4a4bd7] text-[12px] text-center w-[47.33px]">
        <p className="leading-[16px]">Manage</p>
      </div>
    </div>
  );
}

function Container44() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Heading8 />
      <Button3 />
    </div>
  );
}

function MovieItem({ movie, fallbackIndex }: { movie: Movie; fallbackIndex: number }) {
  const fallbackPosters = [imgMoviePoster, imgMoviePoster1, imgMoviePoster2];
  const posterSrc = movie.poster || movie.posterUrl || movie.image || fallbackPosters[fallbackIndex % fallbackPosters.length];
  const title = movie.title || movie.name || "Untitled";
  const genre = movie.genre || "Unknown";
  const duration = movie.duration || "N/A";
  const status = movie.status || "Now Playing";
  const releaseDate = movie.releaseDate || movie.release_date || "";
  const extraText =
    status === "Coming Soon"
      ? `• ${releaseDate ? new Date(releaseDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : "TBA"}`
      : `• ${movie.hall || "Now Showing"}`;

  return (
    <div className="relative rounded-[12px] shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex gap-[16px] items-start p-[8px] relative w-full">
        <div className="h-[80px] max-w-[256px] relative rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 w-[64px]" data-name="Movie Poster">
          <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[8px]">
            <Image alt={title} className="absolute h-full left-0 object-cover top-0 w-full" src={posterSrc} fill sizes="64px" />
          </div>
        </div>

        <div className="content-stretch flex flex-col items-start justify-center relative self-stretch shrink-0 w-[144.09px]" data-name="Container">
          <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 5">
            <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold min-h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#2d3337] text-[14px] w-full">
              <p className="leading-[20px]">{title}</p>
            </div>
          </div>

          <div className="content-stretch flex flex-col items-start pt-[4px] relative shrink-0 w-full" data-name="Margin">
            <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
              <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#596063] text-[10px] tracking-[-0.5px] uppercase w-full">
                <p className="leading-[15px]">{genre} • {duration}</p>
              </div>
            </div>
          </div>

          <div className="content-stretch flex flex-col items-start pt-[8px] relative shrink-0 w-full" data-name="Margin">
            <div className="content-stretch flex gap-[4px] items-center relative shrink-0 w-full" data-name="Container">
              <div
                className={`content-stretch flex flex-col items-start px-[6px] py-[2px] relative rounded-[4px] shrink-0 ${
                  status === "Coming Soon" ? "bg-[rgba(74,75,215,0.1)]" : "bg-[rgba(0,109,74,0.1)]"
                }`}
                data-name="Overlay"
              >
                <div
                  className={`flex flex-col font-['Inter:Bold',sans-serif] font-bold h-[14px] justify-center leading-[0] not-italic relative shrink-0 text-[9px] ${
                    status === "Coming Soon" ? "text-[#4a4bd7]" : "text-[#006d4a]"
                  }`}
                >
                  <p className="leading-[13.5px]">{status}</p>
                </div>
              </div>

              <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
                <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[14px] justify-center leading-[0] not-italic relative shrink-0 text-[#596063] text-[9px]">
                  <p className="leading-[13.5px]">{extraText}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Container45() {
  const [movies, setMovies] = useState<Movie[]>([]);

  useEffect(() => {
    const fetchLatestMovies = async () => {
      try {
        const res = await fetch("http://localhost:3001/movies");
        if (!res.ok) throw new Error("Failed to fetch movies");
        const data: Movie[] = await res.json();

        const latestMovies = [...data]
          .sort((a, b) => {
            const dateA = new Date(a.releaseDate || a.release_date || 0).getTime();
            const dateB = new Date(b.releaseDate || b.release_date || 0).getTime();
            return dateB - dateA;
          })
          .slice(0, 4);

        setMovies(latestMovies);
      } catch (error) {
        console.error("Error fetching latest movies:", error);
      }
    };

    fetchLatestMovies();
  }, []);

  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Container">
      {movies.map((movie, index) => (
        <MovieItem
          key={movie.id ?? `${movie.title || movie.name}-${index}`}
          movie={movie}
          fallbackIndex={index}
        />
      ))}
    </div>
  );
}

function LatestMoviesColumn() {
  return (
    <div className="bg-white col-3 justify-self-stretch relative rounded-[16px] row-1 self-start shadow-[0px_12px_32px_0px_rgba(45,51,55,0.06)] shrink-0" data-name="Latest Movies Column">
      <div className="content-stretch flex flex-col gap-[24px] items-start p-[24px] relative w-full">
        <Container44 />
        <Container45 />
      </div>
    </div>
  );
}

function BottomSections() {
  return (
    <div className="gap-x-[24px] gap-y-[24px] grid grid-cols-[repeat(3,minmax(0,1fr))] grid-rows-[_420px] relative shrink-0 w-full" data-name="Bottom Sections">
      <RecentOrdersTable />
      <LatestMoviesColumn />
    </div>
  );
}

function MainContentAreaPageCanvas() {
  return (
    <div className="relative shrink-0 w-full" data-name="Main Content Area → Page Canvas">
      <div className="content-stretch flex flex-col gap-[32px] items-start pb-[48px] pt-[96px] px-[32px] relative w-full">
        <Container />
        <KpiCardsGrid />
        <BentoChartsLayout />
        <BottomSections />
      </div>
    </div>
  );
}

export default function DashboardPage() {
    return (
        <div className="w-full max-w-[1600px] mx-auto">
            <MainContentAreaPageCanvas />
        </div>
    );
}