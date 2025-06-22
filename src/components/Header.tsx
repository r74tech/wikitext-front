import type React from "react";
import { memo } from "react";
import { NavLink } from "react-router-dom";
import { useAppSelector } from "../store/hooks";

const Header: React.FC = memo(() => {
    const { userName } = useAppSelector((state) => state.user);

    return (
        <div id="header">
            <h1>
                <a href="/" className="active">
                    <span>Wikitext Previewer v3</span>
                </a>
            </h1>
            <h2>
                <span />
            </h2>
            <div id="search-top-box" className="form-search">
                <form id="search-top-box-form" action="dummy" className="input-append">
                    <input
                        id="search-top-box-input"
                        className="text empty search-query"
                        type="text"
                        name="query"
                        defaultValue="Search this site"
                    />
                    <input className="button btn" type="submit" name="search" value="Search" />
                </form>
                <div
                    style={{
                        width: "1px",
                        height: "1px",
                        position: "absolute",
                        pointerEvents: "none",
                        opacity: 0,
                    }}
                />
            </div>
            <div id="top-bar" />
            <div id="login-status">
                <span className="wj-user-info printuser">
                    <NavLink className="wj-user-info-link" to="#">
                        <span className="wj-karma" data-karma="5">
                            <svg
                                className="wj-sprite sprite-wj-karma"
                                viewBox="0 0 64 114"
                                aria-hidden="true"
                            >
                                <use href="/files--static/media/ui.svg#wj-karma" />
                            </svg>
                        </span>
                        <img
                            className="wj-user-info-avatar small"
                            src="/files--static/media/default-avatar.png"
                            alt={userName}
                        />
                    </NavLink>
                    {userName}
                </span>
                |{" "}
                <NavLink id="my-account" to="#">
                    My accounts
                </NavLink>{" "}
                <NavLink id="account-topbutton" to="#">
                    ▼
                </NavLink>
                <div id="account-options" style={{ display: "none" }}>
                    <ul>
                        <li>
                            <a href="https://www.wikidot.com/account/activity">Activity</a>
                        </li>
                        <li>
                            <a href="https://www.wikidot.com/account/messages">Messages</a>
                        </li>
                        <li>
                            <a href="https://www.wikidot.com/account/sites">Sites</a>
                        </li>
                        <li>
                            <a href="https://www.wikidot.com/account/settings">Settings</a>
                        </li>
                        <li>
                            <a href="https://www.wikidot.com/account/upgrade">Upgrade</a>
                        </li>
                        <li>
                            <NavLink to="#">Sign out</NavLink>
                        </li>
                    </ul>
                </div>
            </div>
            <div id="header-extra-div-1">
                <span />
            </div>
            <div id="header-extra-div-2">
                <span />
            </div>
            <div id="header-extra-div-3">
                <span />
            </div>
        </div>
    );
});

Header.displayName = "Header";

export default Header;
