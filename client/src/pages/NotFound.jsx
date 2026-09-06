import { Link } from "react-router-dom";
export default function NotFound(){return <div className="grid min-h-[70vh] place-items-center text-center"><div><p className="text-6xl font-black text-brand-600">404</p><h1 className="mt-3 text-2xl font-bold">Page not found</h1><Link to="/dashboard" className="btn-primary mt-5">Back to dashboard</Link></div></div>}
