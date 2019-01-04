/* eslint-disable react/prop-types */
import * as React from 'react';
import styled from 'styled-components';
import bodymovin from 'lottie-web';


export class Item extends React.Component {
    componentDidMount() {
        const { file, id } = this.props;
        // eslint-disable-next-line import/no-dynamic-require
        const animationData = require(`/${file}`);
        bodymovin.loadAnimation({
            container: document.getElementById(id),
            renderer: 'svg',
            loop: true,
            autoplay: true,
            rendererSettings: {
                progressiveLoad: true,
                preserveAspectRatio: 'xMidYMid meet'
            },
            animationData
        });
    }

    handleClick = () => {
        const { file } = this.props;
        window.location = `/?src=${file}`;
    }

    render() {
        const { title, id, tags } = this.props;

        return (
            <StyledItem onClick={this.handleClick}>
                <Overlay>
                    <h2>{title}</h2>
                    {tags.map((item, i) => <Tag key={i}>{item}</Tag>)}
                </Overlay>
                <Animation id={id} />
            </StyledItem>
        );
    }
}

export default Item;

const StyledItem = styled.div`
    width: 100%;
    height: 100%;
    position: relative;
    color: rgb(80, 80, 80);
    background-color: rgb(255, 255, 255);
    cursor: pointer;
    position: relative;
    backface-visibility: hidden;
    box-shadow: rgba(0, 0, 0, 0.06) 0px 2px 4px, rgba(0, 0, 0, 0.05) 0px 0.5px 1px;
    transition: all 0.333s ease-out 0s;
    border-radius: 4px;

    &:hover {
        transform: translate3d(0px, -1px, 0px);
        box-shadow: rgba(0, 0, 0, 0.22) 0px 19px 43px, rgba(0, 0, 0, 0.18) 0px 4px 11px;
    }
`;

const Overlay = styled.div`
    position: absolute;
    top: 0px;
    left: 0px;
    padding: 15px 20px;

    width: 100%;
    height: 100%;

    z-index: 1;
    opacity: 0;

    background: rgba(98, 100, 167, 0.8);
    color: #fff;
    border-radius: 5px;
    box-sizing: border-box;
    transition: opacity linear 300ms;

    cursor: pointer;

    h2 {
        margin: 0 0 15px 0;
    }

    &:hover {
        opacity: 1;
    }
`;

const Animation = styled.div`
    position: absolute;
    top: 0;
    z-index: 0;
    width: 250px;
    height: 250px;

    svg {
        width: 250px;
        height: 250px;
    }
`;

const Tag = styled.div`
    border-radius: 5px;
    color: #fff;
    background: #1b252d6b;
    padding: 5px 8px;
    display: inline-block;
    white-space: nowrap;
    margin: 0 5px 5px 0;
    font-size: 13px;
`;
