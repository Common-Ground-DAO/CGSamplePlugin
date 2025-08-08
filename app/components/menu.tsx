import { NavLink, useLocation } from "react-router";
import { FaParachuteBox } from "react-icons/fa6";
import { useCgData } from "~/context/cg_data";
import { TbClockDollar } from "react-icons/tb";
import { FaHome } from "react-icons/fa";
import { RiAddLargeFill, RiAdminFill } from "react-icons/ri";
import { Divider } from "./Divider";

const airdropsPathRegex = /^\/airdrops(\/\d*)?$/;
const vestingsPathRegex = /^\/vestings(\/\d*)?$/;

type Props = {
    onSelect: () => void;
}

export default function Menu(props: Props) {
    const { onSelect } = props;
    const { isAdmin } = useCgData();
    const location = useLocation();

    return <nav className="flex flex-col gap-2">
        <div className="bg-slate-100 p-2 rounded self-start gap-1 w-full shadow-lg">
            <NavLink
                to="/"
                className={({ isActive }) => 
                    isActive 
                        ? "flex flex-row gap-2 items-center rounded py-2 px-4 bg-blue-500 text-white" 
                        : "flex flex-row gap-2 items-center rounded py-2 px-4 hover:bg-blue-100"
                }
                onClick={onSelect}
            >
                <FaHome />
                Home
            </NavLink>
        </div>
        {isAdmin && <div className="bg-slate-100 p-2 rounded self-start gap-1 w-full shadow-lg">
            <Divider className="mt-1 mb-2">Admin</Divider>
            <NavLink
                to="/admin"
                className={({ isActive }) => 
                    isActive 
                        ? "flex flex-row gap-2 items-center rounded py-2 px-4 bg-blue-500 text-white" 
                        : "flex flex-row gap-2 items-center rounded py-2 px-4 hover:bg-blue-100"
                }
                onClick={onSelect}
            >
                <RiAdminFill />
                Admin Info
            </NavLink>
        </div>}
    </nav>;
}