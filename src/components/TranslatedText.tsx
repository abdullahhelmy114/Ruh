"use client";

import React from "react";

interface TProps {
  children: string;
}

export function T({ children }: TProps) {
  return React.createElement(React.Fragment, null, children);
}

export default T;