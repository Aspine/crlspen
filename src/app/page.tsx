import React, { useState } from "react";
import Image from "next/image";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default function Home() {
  if (cookies().get("sessionId")?.value && cookies().get("apacheToken")?.value) {
    redirect("/gradebook");
  } else {
    redirect("/login");
  }
}
