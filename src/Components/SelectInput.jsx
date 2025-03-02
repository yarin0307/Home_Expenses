import React from 'react'

export default function SelectInput(props) {

    const handleSelectChange = (e) => {
        if (props.type === "Member") {
            props.setMember(e.target.value)
        }
        else if (props.type === "Expense Category") {
            props.setExpenseCategory(e.target.value)
        }
        else if (props.type === "Availability") {
            props.setAvailablity(e.target.value)
        }
        else if (props.type === "Expense Category Name") {
            props.setExpenseCategoryName(e.target.value)
        }
        else if (props.type === "Expense Type") {
            props.setExpenseType(e.target.value)
        }
    }
    
    return (
        <select className="form-select" value= {props.value} onChange={handleSelectChange}>
            <option value="">{props.type}</option>
            {props.list.map((option, index) => (
                <option value={option} key={index}>
                    {option}
                </option>
            ))}
        </select>
    )
}
