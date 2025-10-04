import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { BsEye, BsEyeSlash } from "react-icons/bs";

import store from "@/store";
import api from "@/services/api";

export default () => {
  const [values, setValues] = useState({
    email: "",
    password: "",
  });
  const [seePassword, setSeePassword] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

  const { user, setUser } = store();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBtnLoading(true);
    try {
      const { user, token } = await api.post(`/auth/signin`, values);
      if (token) api.setToken(token);
      if (user) setUser(user);
      navigate("/");
    } catch (e) {
      console.log("e", e);
      toast.error(e.code);
    } finally {
      setBtnLoading(false);
    }
  };

  if (user) navigate("/");

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="w-full max-w-[450px] px-8 py-8 bg-white rounded-xl shadow-lg border border-gray-100 relative">
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
          <div className="bg-white p-6 rounded-full shadow-md">
            <h1 className="text-3xl font-semibold text-black">EMS</h1>
          </div>
        </div>
        <div className="flex justify-between items-center w-full  px-10 mt-5">
          <h1 className="text-xl font-semibold text-black">
            Sign in to your account
          </h1>
        </div>
        <div className="flex justify-center flex-col w-full mt-5 px-10">
          <div className="flex justify-center flex-col w-full">
            <form
              className="w-full flex flex-wrap gap-3 justify-between text-sm"
              onSubmit={handleSubmit}
            >
              <div className="flex flex-col gap-y-2 w-full">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  name="email"
                  value={values.email}
                  onChange={(e) =>
                    setValues({ ...values, email: e.target.value })
                  }
                  className="w-full bg-transparent ring-1 ring-gray-400 ring-inset rounded-md py-2 lg:py-2.5 px-3 text-xs lg:text-sm focus:ring-inset focus:ring-gray-800 focus:outline-none transition-colors disabled:bg-gray-100"
                  placeholder="Enter your email address"
                />
              </div>

              <div className="flex flex-col gap-y-2 w-full">
                <div className="flex items-center justify-between">
                  <label htmlFor="password">Password</label>
                </div>
                <div className="relative">
                  <input
                    type={seePassword ? "text" : "password"}
                    name="password"
                    value={values.password}
                    onChange={(e) =>
                      setValues({ ...values, password: e.target.value })
                    }
                    className="w-full bg-transparent ring-1 ring-gray-400 ring-inset rounded-md py-2 lg:py-2.5 px-3 text-xs lg:text-sm focus:ring-inset focus:ring-gray-800 focus:outline-none transition-colors disabled:bg-gray-100"
                    placeholder="••••••••"
                  />
                  <div className="absolute top-1/2 -translate-y-1/2 right-4">
                    {seePassword ? (
                      <BsEyeSlash
                        size={18}
                        className="text-app cursor-pointer"
                        onClick={() => setSeePassword(false)}
                      />
                    ) : (
                      <BsEye
                        size={18}
                        className="cursor-pointer"
                        onClick={() => setSeePassword(true)}
                      />
                    )}
                  </div>
                </div>
              </div>

              <button
                className="py-3.5 w-full text-center bg-primary text-white rounded-lg mt-4 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-700"
                disabled={!values.email || !values.password || btnLoading}
                type="submit"
                onClick={handleSubmit}
              >
                {btnLoading ? "Signing in..." : "Sign in"}
              </button>

              <div className="w-full text-sm text-center inline-block text-gray-700">
                Don't have an account?
                <Link
                  className="font-medium text-primary ml-2 hover:underline duration-300 transition-all"
                  to="/auth/signup"
                >
                  Create new account
                </Link>
              </div>
            </form>
          </div>
        </div>
        <div className="text-sm text-center text-gray-500 mt-10">
          © 2025, tangimds.com
        </div>
      </div>
    </div>
  );
};
