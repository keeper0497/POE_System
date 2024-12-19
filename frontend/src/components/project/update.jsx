import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api";
import Navbar from "../../components/Navbar";
import "../../styles/project/update.css";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import "leaflet/dist/leaflet.css";
import "leaflet-geosearch/dist/geosearch.css";


// Add Search Control to Leaflet Map
const SearchControl = () => {
    const map = useMap();
  
    useEffect(() => {
      const provider = new OpenStreetMapProvider();
  
      const searchControl = new GeoSearchControl({
        provider,
        style: "bar",
        showMarker: false,
        showPopup: true,
        zoom: 20,
        retainZoomLevel: false,
        searchLabel: "Enter address",
      });
  
      map.addControl(searchControl);
      return () => map.removeControl(searchControl);
    }, [map]);
  
    return null;
  };
  


function UpdateProject() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        project_name: "",
        project_start: "",
        project_end: "",
        assign_employee: "",
        time_in: "",
        time_out:"",
        status: "ongoing",  // Add status initialization
        address: "",
    });
    const [employees, setEmployees] = useState([]);
    const [location, setLocation] = useState(null);  // State for location

    // Fetch project details
    useEffect(() => {
        api.get(`/api/projects/${id}/`)
            .then((response) => {
                setProject(response.data);
                // // Extract time from ISO string (HH:MM format)
                // const timeIn = response.data.time_in
                //     ? response.data.time_in.split("T")[1].slice(0, 5)
                //     : "";
                // const timeOut = response.data.time_out
                //     ? response.data.time_out.split("T")[1].slice(0, 5)
                //     : "";
                setFormData({
                    project_name: response.data.project_name,
                    project_start: response.data.project_start,
                    project_end: response.data.project_end,
                    assign_employee: response.data.assign_employee,
                    status: response.data.status,  // Ensure status is captured
                    time_in: response.data.time_in || "",
                    time_out: response.data.time_out || "",
                    address: response.data.address
                });
                setLocation({
                    lat: response.data.location.latitude,
                    lng: response.data.location.longitude,
                });
            })
            .catch((err) => setError(err.message));
    }, [id]);

    // Fetch list of employees for the dropdown
    useEffect(() => {
        api.get("/api/users/")
            .then((res) => setEmployees(res.data))
            .catch((err) => alert(`Error fetching employees: ${err.message}`));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!location) {
            alert("Please select a location on the map.");
            return;
        }
        // // Combine date and time into ISO 8601 format
        // const timeInDatetime = formData.project_start && formData.time_in
        // ? `${formData.project_start}T${formData.time_in}:00Z`
        // : null;
 
        // const timeOutDatetime = formData.project_end && formData.time_out
        //     ? `${formData.project_end}T${formData.time_out}:00Z`
        //     : null;
    
        // Prepare data payload
        const data = {
            ...formData,
            // time_in: timeInDatetime,
            // time_out: timeOutDatetime,
            location: location ? { latitude: location.lat, longitude: location.lng } : null,
        };

        api.put(`/api/projects/${id}/`, data)
            .then(() => {
                navigate(`/detail-project/${id}`);
            })
            .catch((err) => setError(err.message));
    };

    // Update location based on user click
    function LocationMarker() {
        useMapEvents({
            click(e) {
                setLocation(e.latlng);
                getAddressFromCoordinates(e.latlng.lat, e.latlng.lng); // Fetch address on marker placement
            },
        });

        return location ? <Marker position={location}></Marker> : null;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!project) {
        return <div>Loading...</div>;
    }

    const geofenceRadius = 800;  // 800 meters radius

    // Function to fetch address using reverse geocoding
    const getAddressFromCoordinates = async (lat, lng) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
            );
            const data = await response.json();
            if (data && data.display_name) {
                setFormData((prevState) => ({
                    ...prevState,
                    address: data.display_name,
                }));
            }
        } catch (error) {
            console.error("Error fetching address:", error);
        }
    };

    return (
        <div>
            <Navbar />
            <div className="update-project">
                <h2>Update Project</h2>
                <form onSubmit={handleSubmit}>
                    <label>
                        Project Name:
                        <input
                            type="text"
                            name="project_name"
                            value={formData.project_name}
                            onChange={handleChange}
                            required
                        />
                    </label>
                    <label>
                        Project Start:
                        <input
                            type="date"
                            name="project_start"
                            value={formData.project_start}
                            onChange={handleChange}
                            required
                        />
                    </label>
                    <label>
                        Project End:
                        <input
                            type="date"
                            name="project_end"
                            value={formData.project_end}
                            onChange={handleChange}
                            required
                        />
                    </label>
                    <label>
                        Tine In:
                        <input
                            type="time"
                            name="time_in"
                            value={formData.time_in}
                            onChange={handleChange}
                            required
                            className="time-in"
                        />
                    </label>
                    <label>
                        Tine out:
                        <input
                            type="time"
                            name="time_out"
                            value={formData.time_out}
                            onChange={handleChange}
                            required
                            className="time-out"
                        />  
                    </label>
                    <label>
                        Assign Employee:
                        <select
                            name="assign_employee"
                            value={formData.assign_employee}
                            onChange={handleChange}
                            required
                            className="select-employee"
                        >
                            <option value="">Select Employee</option>
                            {employees.map((employee) => (
                                <option key={employee.user} value={employee.user}>
                                    {employee.first_name} {employee.last_name}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label>
                        Status:
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            required
                        >
                            <option value="ongoing">Ongoing</option>
                            <option value="done">Done</option>
                            <option value="upcoming">Upcoming</option>
                        </select>
                    </label>
                    <label>
                        Address:
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            required
                            className="address"
                        />
                    </label>
                    <button type="submit">Update Project</button>
                </form>

                <div className="map-container">
                    <MapContainer
                        center={location || [13.6051, 124.2460]} // Default center if no location
                        zoom={13}
                        key={location ? location.lat : 'default'} // Force re-render of map on location change
                        style={{ height: "400px", width: "100%" }}
                    >
                        <SearchControl />
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        {location && (
                            <>
                                <Marker position={location}>
                                    <Popup>{formData.project_name}</Popup>
                                </Marker>
                                <Circle
                                    center={location}
                                    radius={geofenceRadius}
                                    color="blue"
                                    fillColor="blue"
                                    fillOpacity={0.2}
                                />
                            </>
                        )}
                        <LocationMarker />
                    </MapContainer>
                </div>
            </div>
        </div>
    );
}

export default UpdateProject;
