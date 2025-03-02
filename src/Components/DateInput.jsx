import React from 'react'

export default function DateInput(props) {

    const handleSelectChange = (e) => {
        if (props.type === "startDate") {
            props.setStartDate(e.target.value)
        }
        else if (props.type === "endDate") {
            props.setEndDate(e.target.value)
        }
    }

    return (
        <input type="date" value= {props.value} className="form-control" onChange={handleSelectChange} />
    )
}
