import React, { useState } from "react";
import Image from "next/image";
import falconImage from "@/../public/falcon.png";
import redirect from "next/navigation";

export default function Home() {
  redirect("/login");

  return <div></div>;
}
