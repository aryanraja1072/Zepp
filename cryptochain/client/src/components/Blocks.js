import React, { Component } from "react";
import { Link } from "react-router-dom";
import Block from "./Block";

class Blocks extends Component {
  state = { blocks: [] };
  componentDidMount() {
    fetch(`${document.location.origin}/api/blocks`)
      .then((response) => {
        return response.json();
      })
      .then((json) => {
        this.setState({ blocks: json });
      });
  }

  render() {
    return (
      <div>
        <br />
        <div>
          <Link to="/">Home</Link>
        </div>

        <div>
          <h2>Blocks</h2>
        </div>

        <div>
          {this.state.blocks.map((block) => {
            return <Block key={block.hash} block={block} />;
          })}
        </div>
      </div>
    );
  }
}
export default Blocks;
