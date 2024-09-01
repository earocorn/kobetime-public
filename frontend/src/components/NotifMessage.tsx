import { useState } from "react";

interface Props {
    notifmsg: string
}

function NotifMessage(props: Props) {
    let [msg, setMsg] = useState(props.notifmsg);

    return (
    <>
        {msg.length > 1 && (
            <div className="alert alert-primary" role="alert">
            {msg}
            <button className="btn btn-success rounded-pill" onClick={() => setMsg("")} style={{ display:'flex', justifyContent:'center', fontWeight:'bold'}}>OK</button>
            </div>
        )}
    </>
    )
}

export default NotifMessage;