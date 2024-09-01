import { useEffect, useState } from "react"
import { validateAccessClock } from "../employee";
import Clock from "./Clock";


function ClockPage() {
    const [valid, setValid] = useState<boolean | null>(null);

    useEffect(() => {
      validateAccessClock()
        .then((dist) => {
          //CHANGE TO 0.5
          const threshold = 10000;
          const isValid = dist >= 0 && dist <= threshold;
          setValid(isValid);
        })
        .catch((error) => {
          console.error(error);
          setValid(false);
        });
    }, []);
    
    if (valid === null) {
        return (
        <div>Loading...</div>
        )
    }

    return (
      <>
        {/*CHANGE TO valid on production*/true ? (
          <Clock/>
        ) : (
          <h1 style={{ color: "red", display: "flex", justifyContent: "center" }}>
            Access denied.
          </h1>
        )}
      </>
    );
}

export default ClockPage;