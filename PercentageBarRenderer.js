// PercentageBarRenderer.js
import React from 'react';

const PercentageBar = ({ capacity, freeSpace }) => {
    const used = parseFloat(capacity) - parseFloat(freeSpace);
    const percentage = capacity > 0 ? (used / capacity) * 100 : 0;

    // Determine the color based on percentage
    let barColor;
    if (percentage > 75) {
        barColor = '#ff5733'; // Moderate Red for usage > 75%
    } else if (percentage >= 65) {
        barColor = '#ffcc00'; // Golden Yellow for usage between 65% and 75%
    } else {
        barColor = '#4caf50'; // Moderate Green for usage < 65%
    }

    return (
        <div style={{ width: '100%', backgroundColor: '#e0e0e0', borderRadius: '5px' }}>
            <div
                style={{
                    width: `${percentage}%`,
                    backgroundColor: barColor,
                    height: '100%',
                    borderRadius: '5px',
                    textAlign: 'center',
                    lineHeight: '20px' // Center text vertically
                }}
            >
                {percentage.toFixed(2)}%
            </div>
        </div>
    );
};