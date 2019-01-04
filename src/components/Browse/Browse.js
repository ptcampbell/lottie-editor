/* eslint-disable max-len */
/* eslint-disable react/destructuring-assignment */
import * as React from 'react';

// import SVGInline from 'react-svg-inline';
import styled from 'styled-components';
import { SpringGrid } from 'react-stonecutter';

import { Item } from './Item';

export default class Browse extends React.Component<{}, {}> {
    state = {
        illustrations: [
            {
                id: '1',
                title: 'Whale',
                tags: ['shot', 'glasses', 'ono'],
                file: 'whale.json'
            },
            {
                id: '2',
                title: 'Test',
                tags: ['shot', 'glasses', 'ono'],
                file: 'test.json'
            }
        ],
        filter: null
    }

    handleSetFilter(event: any) {
        this.setState({
            filter: event.target.value
        });
    }

    filter(illustrations: any) {
        if (!this.state.filter) {
            return illustrations;
        }
        return illustrations.filter((item) => item.title.toLowerCase().indexOf(this.state.filter.toLowerCase()) >= 0);
    }

    render() {
        const { illustrations = {}, filter } = this.state;

        return (
            <StyledBrowse>
                <Filter>
                    {/* <Icon iconName="Search" /> */}
                    <input placeholder="Find an illustration" onChange={(value) => this.handleSetFilter(value)} value={filter || ''} />
                </Filter>
                <Grid
                    component="ul"
                    columns={3}
                    columnWidth={250}
                    itemHeight={250}
                    gutterWidth={25}
                    gutterHeight={25}
                    springConfig={{ stiffness: 170, damping: 26 }}
                >
                    {this.filter(illustrations).map((item, i) => (
                        <li key={i}>
                            <Item {...item} />
                        </li>
                    ))}
                </Grid>
                <Footer>
                    <p>XCS Illustration Toolkit</p>
                </Footer>
                <Blur />
            </StyledBrowse>
        );
    }
}

const StyledBrowse = styled.div`
    margin:0 auto;
    color: #8898aa;
`;

const Grid = styled(SpringGrid)`
    margin: 0 auto;
    padding: 0 0 140px 0;

    li {
        padding: 0;
        margin: 0;
        list-style: none;
        width: 250px;
        height: 250px;
    }
`;

const Filter = styled.div`
    display: flex;
    margin: 50px auto;
    border: 1px solid #8898aa45;
    border-radius: 5px;
    padding: 8px 12px;
    width: 400px;

    i {
        font-size: 20px;
        transform: scaleX(-1) translate(-6px, 7px);
    }

    input {
        padding: 0;
        border: 0;
        margin: 0 0 0 20px;
        background: transparent;
        flex: auto;
        font-size: 27px;
        opacity: 1;
        letter-spacing: -1px;
        font-weight: 300;
        color: #8898aa;

        &::placeholder {
            color: #8898aa;
        }
        &:focus {
            outline: none;
        }
    }
`;

const Footer = styled.footer`
    position: fixed;
    display: flex;
    justify-content: space-between;
    height: 50px;
    width: 100%;
    border-top: 1px solid #8898aa45;
    bottom: 0px;
    left: 0px;
    z-index: 99;
    backdrop-filter: blur(5px);

    p {
        margin: 15px 20px;
    }

    .SVGInline {
        margin: 12px 20px;
    }
`;

const Blur = styled.div`
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 50px;
    z-index: 95;
    background-color: #f6f9fce8;
    backdrop-filter: blur(5px);
`;