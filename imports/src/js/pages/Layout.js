import React from "react";
import { Link } from "react-router";

export default class Layout extends React.Component {
  render() {
    const { location } = this.props;
    const containerStyle = {
      marginTop: "60px"
    };
    console.log("layout");
    return (
      <div>
        {this.props.children}
      </div>

    );
  }
}
