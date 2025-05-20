/**
 * Modal Controller for Running Cats game
 * Handles the display and interaction with modal windows
 */

class ModalController {
  constructor() {
    this.init();
  }
  
  /**
   * Initialize the modal controller
   */
  init() {
    // Get DOM elements
    this.modal = document.getElementById('controls-modal');
    this.showControlsBtn = document.getElementById('show-controls');
    this.closeModalBtn = document.querySelector('.close-modal');
    
    // Set up event listeners
    this.setupEventListeners();
  }
  
  /**
   * Set up event listeners for modal controls
   */
  setupEventListeners() {
    // Show modal when keyboard icon is clicked
    if (this.showControlsBtn) {
      this.showControlsBtn.addEventListener('click', () => {
        this.showModal();
      });
    }
    
    // Close modal when X is clicked
    if (this.closeModalBtn) {
      this.closeModalBtn.addEventListener('click', () => {
        this.hideModal();
      });
    }
    
    // Close modal when clicking outside of it
    window.addEventListener('click', (event) => {
      if (event.target === this.modal) {
        this.hideModal();
      }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.modal.classList.contains('show')) {
        this.hideModal();
      }
    });
  }
  
  /**
   * Show the modal
   */
  showModal() {
    if (this.modal) {
      this.modal.classList.add('show');
      setTimeout(() => {
        const modalContent = this.modal.querySelector('.modal-content');
        if (modalContent) {
          modalContent.style.opacity = '1';
          modalContent.style.transform = 'translateY(0)';
        }
      }, 10);
    }
  }
  
  /**
   * Hide the modal
   */
  hideModal() {
    if (this.modal) {
      const modalContent = this.modal.querySelector('.modal-content');
      if (modalContent) {
        modalContent.style.opacity = '0';
        modalContent.style.transform = 'translateY(-50px)';
      }
      
      setTimeout(() => {
        this.modal.classList.remove('show');
      }, 300);
    }
  }
}

export default ModalController;
