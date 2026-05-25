import imgImage9 from "figma:asset/9862d012458576518fbe9d4dc78e607024345e07.png";

function Group4() {
  return (
    <div className="absolute contents left-[calc(79.17%-37px)] top-[644.5px] translate-x-[-50%]">
      <div className="absolute bg-[#3f9651] h-[63px] left-[calc(79.17%-37px)] rounded-[124px] top-[644.5px] translate-x-[-50%] w-[466px]" />
      <p className="absolute font-['Outfit:Bold',sans-serif] font-bold leading-[normal] left-[calc(79.17%-75px)] text-[29px] text-[rgba(255,255,255,0.85)] top-[657px] w-[110px]">Sign up</p>
    </div>
  );
}

function Group5() {
  return (
    <div className="absolute contents left-[calc(79.17%-37px)] top-[644.5px] translate-x-[-50%]">
      <Group4 />
    </div>
  );
}

function Group3() {
  return (
    <div className="absolute contents left-[calc(58.33%+32px)] top-[336.5px]">
      <div className="absolute bg-white border-2 border-[#3f9651] border-solid h-[63px] left-[calc(79.17%-35px)] rounded-[18px] top-[336.5px] translate-x-[-50%] w-[466px]" />
      <p className="absolute font-['Outfit:Regular',sans-serif] font-normal leading-[1.27] left-[calc(58.33%+49px)] opacity-[0.32] text-[23px] text-[rgba(0,0,0,0.9)] top-[353.5px] tracking-[0.115px] w-[124px]">Username</p>
    </div>
  );
}

function Group6() {
  return (
    <div className="absolute contents left-[calc(58.33%+30px)] top-[419px]">
      <div className="absolute bg-white border-2 border-[#3f9651] border-solid h-[63px] left-[calc(79.17%-37px)] rounded-[18px] top-[419px] translate-x-[-50%] w-[466px]" />
      <p className="absolute font-['Outfit:Regular',sans-serif] font-normal leading-[1.27] left-[calc(58.33%+47px)] opacity-[0.32] text-[23px] text-[rgba(0,0,0,0.9)] top-[436px] tracking-[0.115px] w-[124px]">Email</p>
    </div>
  );
}

function Group2() {
  return (
    <div className="absolute contents left-[calc(58.33%+30px)] top-[500px]">
      <div className="absolute bg-white border-2 border-[#3f9651] border-solid h-[63px] left-[calc(79.17%-37px)] rounded-[18px] top-[500px] translate-x-[-50%] w-[466px]" />
      <p className="absolute font-['Outfit:Regular',sans-serif] font-normal leading-[1.27] left-[calc(58.33%+50px)] opacity-[0.32] text-[23px] text-[rgba(0,0,0,0.9)] top-[517px] tracking-[0.115px] w-[124px]">Password</p>
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute contents left-[calc(66.67%+1px)] top-[262px]">
      <div className="absolute bg-white border border-[#3f9651] border-solid h-[49px] left-[calc(70.83%+5.5px)] rounded-[56px] top-[262px] translate-x-[-50%] w-[129px]" />
      <p className="absolute font-['Outfit:Regular',sans-serif] font-normal leading-[1.27] left-[calc(66.67%+32px)] text-[23px] text-[rgba(0,0,0,0.9)] top-[272px] tracking-[0.115px] w-[73px]">Admin</p>
    </div>
  );
}

function Group() {
  return (
    <div className="absolute contents left-[calc(75%+52px)] top-[262px]">
      <div className="absolute bg-white border border-[#3f9651] border-solid h-[49px] left-[calc(79.17%+56.5px)] rounded-[56px] top-[262px] translate-x-[-50%] w-[129px]" />
      <p className="absolute font-['Outfit:Regular',sans-serif] font-normal leading-[1.27] left-[calc(75%+77px)] text-[23px] text-[rgba(0,0,0,0.9)] top-[272px] tracking-[0.115px] w-[85px]">Cashier</p>
    </div>
  );
}

export default function SignUp() {
  return (
    <div className="bg-gradient-to-l from-[#d1edc5] from-[49.038%] relative size-full to-[#ffffff]" data-name="SIGN UP">
      <p className="absolute font-['Outfit:Bold',sans-serif] font-bold leading-[normal] left-[calc(58.33%+32px)] text-[55px] text-[rgba(68,156,86,0.85)] top-[130px] w-[345px]">POS Sign up</p>
      <Group5 />
      <Group3 />
      <Group6 />
      <Group2 />
      <p className="absolute font-['Outfit:Regular',sans-serif] font-normal leading-[1.27] left-[calc(58.33%+37px)] text-[17px] text-[rgba(0,0,0,0.9)] top-[214px] tracking-[0.085px] w-[213px]">{`Already have an account? `}</p>
      <p className="absolute font-['Outfit:ExtraBold',sans-serif] font-extrabold leading-[1.27] left-[calc(75%-1px)] text-[17px] text-[rgba(0,0,0,0.9)] top-[214px] tracking-[0.085px] w-[82px]">Log in</p>
      <div className="absolute h-[856px] left-[-52px] top-[82px] w-[853px]" data-name="image 9">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImage9} />
      </div>
      <Group1 />
      <Group />
    </div>
  );
}