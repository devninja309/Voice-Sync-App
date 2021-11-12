//List of active projects
import logo from '../logo.svg';
import {GetProjects} from '.././Etc/URLInterface'

import {useState, useEffect} from 'react';
import { PageWrapper } from '../Components/PageWrapper';
import ProjectList from '../Components/ProjectList';

const ProjectListPage = (props) => {
    console.log('AccessToken');
    console.log(props);

    return  (     
        <PageWrapper>
        <div className="App">
            <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <p>
                This is the Project List Page
            </p>
            <ProjectList accessToken = {props.accessToken}/>
            
            </header>
        </div>
        </PageWrapper>
    )
}
export default ProjectListPage;