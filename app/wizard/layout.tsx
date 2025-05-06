import React from "react";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative flex w-full flex-col items-center justify-center">
      {children}
    </div>
  );
};

export default layout;
