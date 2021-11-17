//List of active projects
import logo from '../logo.svg';
import {GetProjects} from '.././Etc/URLInterface'

import {useState, useEffect} from 'react';
import { PageWrapper } from '../Components/PageWrapper';
import ProjectList from '../Components/ProjectList';
import { BigLogo } from '../Elements/Logos';

const ProjectListPage = (props) => {
    console.log('AccessToken');
    console.log(props);

    return  (     
        <PageWrapper>
        <div className="App">
            <header className="App-header">
            <BigLogo/>
            <p>
                
            </p>
            <ProjectList accessToken = {props.accessToken}/>
            
            </header>
        </div>
        </PageWrapper>
    )
}
export default ProjectListPage;