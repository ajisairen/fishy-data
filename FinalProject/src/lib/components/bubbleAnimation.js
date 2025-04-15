export function startBubbleAnimation() {
    const colors = [
        "bg-[#40729b]",
        "bg-[#205b8b]",
        "bg-[#608aac]"
    ];

    const maxBubbles = 15;
    let curBubbles = 0;

    function createBubble() {
        if (curBubbles >= maxBubbles) {
            return;
        }

        const bubble = document.createElement("div");
        bubble.classList.add("bubble");

        const size = Math.random() * 80;
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;

        const startPos = Math.random() * 100;
        bubble.style.left = `${startPos}%`;

        const duration = Math.random() * 15 + 10;
        bubble.style.setProperty("--random-offset", Math.random() * 360 + "deg");
        bubble.style.animation = `float ${duration}s linear infinite`;

        bubble.classList.add(colors[Math.floor(Math.random() * colors.length)]);

        const container = document.getElementById("bubble-container");
        if (container) {
            container.appendChild(bubble);
            curBubbles++;
        }

        bubble.addEventListener("animationend", () => {
            bubble.remove();
            curBubbles--;
        });
    }

    function animate() {
        createBubble();
        setTimeout(() => requestAnimationFrame(animate), 1000);
    }

    animate();
}