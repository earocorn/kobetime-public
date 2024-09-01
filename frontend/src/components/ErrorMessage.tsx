interface Props {
    errormsg: string
}

function ErrorMessage(props: Props) {

    return (
    <>
        {props.errormsg.length > 1 && (
            <div className="alert alert-danger" role="alert">
            {props.errormsg}
            </div>
        )}
    </>
    )
}

export default ErrorMessage;