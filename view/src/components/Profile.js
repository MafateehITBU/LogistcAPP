import React from 'react';
import { useLocation } from 'react-router-dom';

const Profile = () => {
    const { state } = useLocation();  // Access the state passed via navigate
    const { admin } = state || {};

    return (
        <div className="container" style={{ marginTop: "80px" }}>
            <div class="row d-flex flex-column justify-content-center align-items-center">
                {/* Left Card */}
                <div class="col-md-4 ">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex flex-column align-items-center text-center">
                                <img src="https://bootdey.com/img/Content/avatar/avatar7.png" alt="Admin" class="rounded-circle" width="150" />
                                <div class="mt-3">
                                    <h4>{admin?.name}</h4>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Right Card */}
                <div class="col-md-8">
                    <div class="card">
                        <div class="card-body">
                            <div class="row text-center">
                                <div class="col-sm-3">
                                    <h6 class="mb-0">Name</h6>
                                </div>
                                <div class="col-sm-9 text-secondary">
                                    {admin?.name}
                                </div>
                            </div>
                            <hr />
                            <div class="row text-center">
                                <div class="col-sm-3">
                                    <h6 class="mb-0">Email</h6>
                                </div>
                                <div class="col-sm-9 text-secondary">
                                    {admin?.email}
                                </div>
                            </div>
                            <hr />
                            <div class="row text-center">
                                <div class="col-sm-3">
                                    <h6 class="mb-0">Phone</h6>
                                </div>
                                <div class="col-sm-9 text-secondary">
                                    {admin?.phone}
                                </div>
                            </div>
                            <hr />
                            <div class="row text-center">
                                <div class="col-sm-3">
                                    <h6 class="mb-0">Role</h6>
                                </div>
                                <div class="col-sm-9 text-secondary">
                                    {admin?.role}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;