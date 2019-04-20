import React from "react"
import classnames from 'classnames';

const Header = (props) => {
    return (
        <React.Fragment>
            <header>
                <div className="logo-container">
                    <div
                        className="logo icon-logo"
                        onClick={() => {
                            alert("Logo")
                        }}
                    />
                </div>
                <div className="layouts">
                    <div
                        className={classnames('button icon-trophy', {
                            active: props.activeVisual === "ranking",
                        })}
                        onClick={() => {
                            props.setActive("ranking")
                        }}
                        title="Rankings"
                    />
                    <div
                        className={classnames('button icon-plane', {
                            active: props.activeVisual === "airline",
                        })}
                        onClick={() => {
                            props.setActive("airline")
                        }}
                        title="Airline"
                    />
                    <div
                        className={classnames('button icon-data', {
                            active: (props.activeVisual === "data"),
                        })}
                        onClick={() => {
                            props.setActive("data")
                        }}
                        title="Data"
                    />
                    <div
                        className={classnames('button icon-historical', {
                            active: props.activeVisual === "route",
                        })}
                        onClick={() => {
                            props.setActive("route")
                        }}
                        title="Historical"
                    />
                </div>
                <div
                    className="about"
                >
                    <div
                        className={classnames('button icon-about', {
                            active: false,
                        })}
                        onClick={() => {
                            alert("About modal")
                        }}
                        title="about"
                    />
                </div>


            </header>
        </React.Fragment>
    )
}

export default Header